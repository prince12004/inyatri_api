import * as bookingRepository from "../../repositories/user/booking.repository.js";
import * as cabRepository from "../../repositories/user/cab.repository.js";
import * as couponRepository from "../../repositories/admin/coupon.repository.js";
import ApiError from "../../utils/ApiError.js";
import {
  buildPayuCheckoutFormHtml,
  buildPayuCheckoutPayload,
  fetchPayuTransactionStatus,
  isDevPaymentToolsEnabled,
  isPayuCancelledStatus,
  isPayuSuccessStatus,
  parsePayuVerifyPaymentResponse,
  resolvePayuRedirectLocation,
  verifyPayuResponseHash,
} from "../../utils/payment/payu.util.js";
import {
  BOOKING_STATUS,
  PAYMENT_ATTEMPT_STATUS,
  PAYMENT_STATUS,
} from "../../utils/constants/booking.enums.js";
import logger from "../../utils/logger.js";

const isBookingPaymentComplete = (booking) =>
  booking.payment_status === PAYMENT_STATUS.SUCCESS ||
  (booking.payment_option === "part" &&
    booking.payment_status === PAYMENT_STATUS.PARTIALLY_PAID);

const isBookingAwaitingPayuReconcile = (booking) =>
  booking.payu_txn_id &&
  booking.booking_status === BOOKING_STATUS.PAYMENT_PROCESSING &&
  (booking.payment_status === PAYMENT_STATUS.INITIATED ||
    booking.payment_status === PAYMENT_STATUS.NOT_INITIATED);

const resolvePaymentOutcome = (payload) => {
  if (isPayuSuccessStatus(payload.status)) {
    return {
      bookingStatus: BOOKING_STATUS.CONFIRMED,
      paymentStatus: PAYMENT_STATUS.SUCCESS,
      attemptStatus: PAYMENT_ATTEMPT_STATUS.SUCCESS,
    };
  }

  if (isPayuCancelledStatus(payload.status, payload.error_Message)) {
    return {
      bookingStatus: BOOKING_STATUS.PAYMENT_CANCELLED,
      paymentStatus: PAYMENT_STATUS.CANCELLED,
      attemptStatus: PAYMENT_ATTEMPT_STATUS.CANCELLED,
    };
  }

  return {
    bookingStatus: BOOKING_STATUS.PAYMENT_FAILED,
    paymentStatus: PAYMENT_STATUS.FAILED,
    attemptStatus: PAYMENT_ATTEMPT_STATUS.FAILED,
  };
};

const applyPaymentUpdate = async (booking, payload, outcome) => {
  const latestAttempt = await bookingRepository.findLatestPaymentAttempt(
    booking.id
  );

  const responseAmount = Number(payload.amount);
  const expectedAmount = Number(latestAttempt?.amount ?? booking.payable_amount);
  if (
    Number.isFinite(responseAmount) &&
    Math.abs(responseAmount - expectedAmount) > 0.01
  ) {
    throw new ApiError(400, "Payment amount mismatch");
  }

  return bookingRepository.withTransaction(async (transaction) => {
    if (latestAttempt) {
      await bookingRepository.updatePaymentAttempt(
        latestAttempt.id,
        {
          status: outcome.attemptStatus,
          gateway_response: payload,
        },
        transaction
      );
    }

    const isSuccess = outcome.paymentStatus === PAYMENT_STATUS.SUCCESS;
    const paidAmount = isSuccess
      ? Number(booking.paid_amount || 0) + responseAmount
      : Number(booking.paid_amount || 0);

    const isPartiallyPaid =
      isSuccess &&
      booking.payment_option === "part" &&
      Number(booking.remaining_amount) > 0;

    const resolvedPaymentStatus = isPartiallyPaid
      ? PAYMENT_STATUS.PARTIALLY_PAID
      : outcome.paymentStatus;

    const bookingUpdates = {
      booking_status: outcome.bookingStatus,
      payment_status: resolvedPaymentStatus,
      paid_amount: paidAmount,
      payu_txn_id: payload.txnid || booking.payu_txn_id,
      payu_mihpayid: payload.mihpayid || null,
      payu_payment_id: payload.payuMoneyId || payload.bank_ref_num || null,
    };

    await bookingRepository.updateBooking(booking.id, bookingUpdates, transaction);

    if (outcome.paymentStatus === PAYMENT_STATUS.SUCCESS && booking.coupon_id) {
      const existingUsage = await bookingRepository.findCouponUsageByUser(
        booking.coupon_id,
        booking.user_id
      );

      if (!existingUsage) {
        await bookingRepository.createCouponUsage(
          {
            coupon_id: booking.coupon_id,
            user_id: booking.user_id,
            booking_id: booking.id,
            discount_amount: booking.discount_amount,
          },
          transaction
        );

        await couponRepository.incrementUsedCount(booking.coupon_id, transaction);
      }
    }

    return {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      booking_status:
        outcome.bookingStatus === BOOKING_STATUS.CONFIRMED
          ? "confirmed"
          : outcome.bookingStatus === BOOKING_STATUS.PAYMENT_CANCELLED
            ? "payment_cancelled"
            : "payment_failed",
      payment_status:
        resolvedPaymentStatus === PAYMENT_STATUS.PARTIALLY_PAID
          ? "partially_paid"
          : outcome.paymentStatus === PAYMENT_STATUS.SUCCESS
            ? "success"
            : outcome.paymentStatus === PAYMENT_STATUS.CANCELLED
              ? "cancelled"
              : "failed",
      txnid: payload.txnid,
      amount: payload.amount,
    };
  });
};

const applyCabPaymentUpdate = async (booking, payload, outcome) => {
  const latestAttempt = await cabRepository.findLatestCabPaymentAttempt(
    booking.id
  );

  const responseAmount = Number(payload.amount);
  const expectedAmount = Number(latestAttempt?.amount ?? booking.payable_amount);
  if (
    Number.isFinite(responseAmount) &&
    Math.abs(responseAmount - expectedAmount) > 0.01
  ) {
    throw new ApiError(400, "Payment amount mismatch");
  }

  return cabRepository.withTransaction(async (transaction) => {
    if (latestAttempt) {
      await cabRepository.updateCabPaymentAttempt(
        latestAttempt.id,
        {
          status: outcome.attemptStatus,
          gateway_response: payload,
        },
        transaction
      );
    }

    const isSuccess = outcome.paymentStatus === PAYMENT_STATUS.SUCCESS;
    const paidAmount = isSuccess
      ? Number(booking.paid_amount || 0) + responseAmount
      : Number(booking.paid_amount || 0);

    const bookingUpdates = {
      booking_status: outcome.bookingStatus,
      payment_status: outcome.paymentStatus,
      paid_amount: paidAmount,
      remaining_amount: Math.max(0, Number(booking.total_booking_amount) - paidAmount),
      payu_txn_id: payload.txnid || booking.payu_txn_id,
      payu_mihpayid: payload.mihpayid || null,
      payu_payment_id: payload.payuMoneyId || payload.bank_ref_num || null,
    };

    await cabRepository.updateCabBooking(booking.id, bookingUpdates, transaction);

    return {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      booking_status:
        outcome.bookingStatus === BOOKING_STATUS.CONFIRMED
          ? "confirmed"
          : outcome.bookingStatus === BOOKING_STATUS.PAYMENT_CANCELLED
            ? "payment_cancelled"
            : "payment_failed",
      payment_status:
        outcome.paymentStatus === PAYMENT_STATUS.SUCCESS
          ? "success"
          : outcome.paymentStatus === PAYMENT_STATUS.CANCELLED
            ? "cancelled"
            : "failed",
      txnid: payload.txnid,
      amount: payload.amount,
      is_cab: true,
    };
  });
};

const buildPayloadFromVerify = (verified, booking) => ({
  status: verified.status,
  amount: verified.amount,
  txnid: verified.txnid,
  mihpayid: verified.mihpayid,
  bank_ref_num: verified.bank_ref_num,
  productinfo: verified.productinfo,
  firstname: verified.firstname,
  email: verified.email,
  key: verified.key,
  udf1: String(booking.id),
});

/** PayU-recommended server verify (works when browser POST/hash/callback fails). */
export const reconcilePaymentByTxnid = async (txnid) => {
  if (!txnid) {
    return { reconciled: false, reason: "missing_txnid" };
  }

  let booking = await bookingRepository.findBookingByPayuTxnId(txnid);
  let isCab = false;
  if (!booking) {
    booking = await cabRepository.findCabBookingByPayuTxnId(txnid);
    if (booking) isCab = true;
  }

  if (!booking) {
    return { reconciled: false, reason: "booking_not_found" };
  }

  const isComplete = isCab
    ? booking.payment_status === PAYMENT_STATUS.SUCCESS
    : isBookingPaymentComplete(booking);

  if (isComplete) {
    return {
      reconciled: true,
      result: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        booking_status: "confirmed",
        payment_status:
          !isCab && booking.payment_status === PAYMENT_STATUS.PARTIALLY_PAID
            ? "partially_paid"
            : "success",
        already_processed: true,
        source: "verify_payment",
        is_cab: isCab,
      },
    };
  }

  let apiResponse;
  try {
    apiResponse = await fetchPayuTransactionStatus(txnid);
  } catch (error) {
    logger.error("PayU verify_payment request failed", {
      txnid,
      message: error.message,
    });
    return { reconciled: false, reason: "verify_request_failed" };
  }

  const verified = parsePayuVerifyPaymentResponse(apiResponse, txnid);

  if (!verified) {
    logger.warn("PayU verify_payment unparsed response", {
      txnid,
      msg: apiResponse?.msg,
    });
    return {
      reconciled: false,
      reason: "verify_unparsed",
      payu_message: apiResponse?.msg,
    };
  }

  if (verified.status === "api_error") {
    logger.error("PayU verify_payment API error", {
      txnid,
      error: verified.error,
    });
    return {
      reconciled: false,
      reason: "verify_api_error",
      payu_message: verified.error,
    };
  }

  if (
    verified.status === "pending" ||
    verified.status === "not found" ||
    verified.status === "in progress"
  ) {
    return {
      reconciled: true,
      pending: true,
      result: {
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        booking_status: "payment_processing",
        payment_status: "initiated",
        payu_status: verified.status,
        source: "verify_payment",
        message: "Payment is still pending at PayU",
        is_cab: isCab,
      },
    };
  }

  const payload = buildPayloadFromVerify(verified, booking);
  const outcome = resolvePaymentOutcome(payload);
  const result = isCab
    ? await applyCabPaymentUpdate(booking, payload, outcome)
    : await applyPaymentUpdate(booking, payload, outcome);

  return { reconciled: true, result: { ...result, source: "verify_payment" } };
};

export const handlePayuCallback = async (payload) => {
  const txnid = payload.txnid;

  if (txnid) {
    const verified = await reconcilePaymentByTxnid(txnid);
    if (verified.reconciled && verified.result) {
      return verified.result;
    }
  }

  if (!verifyPayuResponseHash(payload)) {
    if (txnid) {
      const retryVerify = await reconcilePaymentByTxnid(txnid);
      if (retryVerify.reconciled && retryVerify.result) {
        return retryVerify.result;
      }
    }
    throw new ApiError(400, "Invalid PayU response hash");
  }

  let booking = null;
  let isCab = payload.udf2 === "cab";
  const bookingIdFromUdf = Number(payload.udf1);

  if (isCab) {
    if (bookingIdFromUdf) {
      booking = await cabRepository.findCabBookingById(bookingIdFromUdf);
    }
    if (!booking && txnid) {
      booking = await cabRepository.findCabBookingByPayuTxnId(txnid);
    }
  } else {
    if (bookingIdFromUdf) {
      booking = await bookingRepository.findBookingById(bookingIdFromUdf);
    }
    if (!booking && txnid) {
      booking = await bookingRepository.findBookingByPayuTxnId(txnid);
    }
    if (!booking && txnid) {
      booking = await cabRepository.findCabBookingByPayuTxnId(txnid);
      if (booking) isCab = true;
    }
  }

  if (!booking) {
    throw new ApiError(404, "Booking not found for this payment");
  }

  const isComplete = isCab
    ? booking.payment_status === PAYMENT_STATUS.SUCCESS
    : isBookingPaymentComplete(booking);

  if (isComplete) {
    return {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      booking_status: "confirmed",
      payment_status: "success",
      already_processed: true,
      is_cab: isCab,
    };
  }

  const outcome = resolvePaymentOutcome(payload);
  return isCab
    ? applyCabPaymentUpdate(booking, payload, outcome)
    : applyPaymentUpdate(booking, payload, outcome);
};

/** Reconcile with PayU when browser/surl callback failed (verify_payment API). */
export const syncBookingPaymentFromPayu = async (bookingId, userId) => {
  const booking = await bookingRepository.findBookingById(bookingId, userId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (isBookingPaymentComplete(booking)) {
    return {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      booking_status: "confirmed",
      payment_status:
        booking.payment_status === PAYMENT_STATUS.PARTIALLY_PAID
          ? "partially_paid"
          : "success",
      already_processed: true,
      source: "verify_payment",
    };
  }

  if (!booking.payu_txn_id) {
    throw new ApiError(400, "No PayU transaction id on this booking");
  }

  const verified = await reconcilePaymentByTxnid(booking.payu_txn_id);
  if (verified.reconciled && verified.result) {
    return verified.result;
  }

  throw new ApiError(
    502,
    verified.payu_message ||
      "Unable to verify payment status with PayU. Check PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT on the server."
  );
};

export const syncCabBookingPaymentFromPayu = async (bookingId, userId) => {
  const booking = await cabRepository.findCabBookingById(bookingId, userId);
  if (!booking) {
    throw new ApiError(404, "Cab booking not found");
  }

  if (booking.payment_status === PAYMENT_STATUS.SUCCESS) {
    return {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      booking_status: "confirmed",
      payment_status: "success",
      already_processed: true,
      source: "verify_payment",
      is_cab: true,
    };
  }

  if (!booking.payu_txn_id) {
    throw new ApiError(400, "No PayU transaction id on this cab booking");
  }

  const verified = await reconcilePaymentByTxnid(booking.payu_txn_id);
  if (verified.reconciled && verified.result) {
    return verified.result;
  }

  throw new ApiError(
    502,
    verified.payu_message ||
      "Unable to verify payment status with PayU. Check PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT on the server."
  );
};

export const maybeReconcileBookingPayment = async (booking) => {
  if (!isBookingAwaitingPayuReconcile(booking)) {
    return booking;
  }

  try {
    await reconcilePaymentByTxnid(booking.payu_txn_id);
  } catch (error) {
    logger.warn("Auto payment reconcile skipped", {
      bookingId: booking.id,
      message: error.message,
    });
  }

  return bookingRepository.findBookingById(booking.id, booking.user_id);
};

const loadPayuRedirectContext = async (bookingId, user) => {
  if (!isDevPaymentToolsEnabled()) {
    throw new ApiError(404, "Not found");
  }

  if (!process.env.PAYU_MERCHANT_KEY || !process.env.PAYU_MERCHANT_SALT) {
    throw new ApiError(
      500,
      "PayU is not configured. Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT."
    );
  }

  const booking = await bookingRepository.findBookingById(bookingId, user.id);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.payment_status === PAYMENT_STATUS.SUCCESS) {
    throw new ApiError(400, "Payment already completed for this booking");
  }

  if (!booking.payu_txn_id) {
    throw new ApiError(
      400,
      "No payment session found. Run checkout or retry payment first."
    );
  }

  const payu = buildPayuCheckoutPayload({
    booking,
    user,
    txnid: booking.payu_txn_id,
  });

  return { booking, payu };
};

export const preparePayuRedirectForBooking = async (bookingId, user, options = {}) => {
  const { payu } = await loadPayuRedirectContext(bookingId, user);
  const forceForm = options.forceForm === true;

  let redirectLocation = null;
  if (!forceForm) {
    try {
      redirectLocation = await resolvePayuRedirectLocation(payu);
    } catch (error) {
      redirectLocation = null;
    }
  }

  return {
    payu,
    redirectLocation,
    html: buildPayuCheckoutFormHtml(payu),
  };
};

export const buildPayuRedirectPageForBooking = async (bookingId, user) => {
  const { html } = await preparePayuRedirectForBooking(bookingId, user, {
    forceForm: true,
  });
  return html;
};

export const buildPayuRedirectHtml = (result, isSuccess) => {
  const payload = JSON.stringify(result);
  const title = isSuccess ? "Payment Success" : "Payment Failed";
  const message = isSuccess
    ? "Payment processed successfully. You can return to the app."
    : "Payment was not completed. You can return to the app and retry.";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
  </head>
  <body>
    <h2>${title}</h2>
    <p>${message}</p>
    <script>
      window.paymentResult = ${payload};
    </script>
  </body>
</html>`;
};

export const buildPayuCallbackErrorHtml = (message) => `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Payment</title></head>
  <body>
    <h2>Payment could not be confirmed</h2>
    <p>${message}</p>
    <p>Return to the app and tap &quot;Sync payment&quot; or retry if amount was debited.</p>
  </body>
</html>`;
