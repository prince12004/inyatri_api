import * as bookingRepository from "../../repositories/user/booking.repository.js";
import * as couponRepository from "../../repositories/admin/coupon.repository.js";
import ApiError from "../../utils/ApiError.js";
import {
  buildPayuCheckoutFormHtml,
  buildPayuCheckoutPayload,
  isDevPaymentToolsEnabled,
  isPayuCancelledStatus,
  isPayuSuccessStatus,
  resolvePayuRedirectLocation,
  verifyPayuResponseHash,
} from "../../utils/payment/payu.util.js";
import {
  BOOKING_STATUS,
  PAYMENT_ATTEMPT_STATUS,
  PAYMENT_STATUS,
} from "../../utils/constants/booking.enums.js";

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

export const handlePayuCallback = async (payload) => {
  if (!verifyPayuResponseHash(payload)) {
    throw new ApiError(400, "Invalid PayU response hash");
  }

  let booking = null;

  const bookingIdFromUdf = Number(payload.udf1);
  if (bookingIdFromUdf) {
    booking = await bookingRepository.findBookingById(bookingIdFromUdf);
  }

  if (!booking && payload.txnid) {
    booking = await bookingRepository.findBookingByPayuTxnId(payload.txnid);
  }

  if (!booking) {
    throw new ApiError(404, "Booking not found for this payment");
  }

  if (booking.payment_status === PAYMENT_STATUS.SUCCESS) {
    return {
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      booking_status: "confirmed",
      payment_status: "success",
      already_processed: true,
    };
  }

  const responseAmount = Number(payload.amount);
  const bookingAmount = Number(booking.payable_amount);
  if (
    Number.isFinite(responseAmount) &&
    Math.abs(responseAmount - bookingAmount) > 0.01
  ) {
    throw new ApiError(400, "Payment amount mismatch");
  }

  const outcome = resolvePaymentOutcome(payload);

  return bookingRepository.withTransaction(async (transaction) => {
    const latestAttempt = await bookingRepository.findLatestPaymentAttempt(
      booking.id
    );

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

    const bookingUpdates = {
      booking_status: outcome.bookingStatus,
      payment_status: outcome.paymentStatus,
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
        outcome.paymentStatus === PAYMENT_STATUS.SUCCESS
          ? "success"
          : outcome.paymentStatus === PAYMENT_STATUS.CANCELLED
            ? "cancelled"
            : "failed",
      txnid: payload.txnid,
      amount: payload.amount,
    };
  });
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
