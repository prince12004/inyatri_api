import * as payuService from "../../services/payment/payu.service.js";
import {
  extractPayuCallbackPayload,
  setPayuCheckoutPageHeaders,
} from "../../utils/payment/payu.util.js";
import { errorResponse } from "../../utils/response.js";
import logger from "../../utils/logger.js";

const handlePayuBrowserCallback = async (req, res, isSuccessRoute) => {
  const payload = extractPayuCallbackPayload(req);
  logger.info("PayU callback received", {
    route: isSuccessRoute ? "success" : "failure",
    txnid: payload.txnid,
    status: payload.status,
    amount: payload.amount,
  });

  try {
    const result = await payuService.handlePayuCallback(payload);
    return res
      .status(200)
      .send(payuService.buildPayuRedirectHtml(result, isSuccessRoute));
  } catch (error) {
    logger.error("PayU callback error:", {
      message: error.message,
      txnid: payload.txnid,
    });

    if (payload.txnid) {
      try {
        const verified = await payuService.reconcilePaymentByTxnid(payload.txnid);
        if (verified.reconciled && verified.result && !verified.pending) {
          return res
            .status(200)
            .send(payuService.buildPayuRedirectHtml(verified.result, isSuccessRoute));
        }
      } catch (reconcileError) {
        logger.error("PayU callback reconcile fallback failed:", reconcileError);
      }
    }

    // PayU/browser expects HTML; JSON often breaks their return handler.
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res
        .status(200)
        .send(payuService.buildPayuCallbackErrorHtml(error.message));
    }

    return errorResponse(error, res);
  }
};

export const payuSuccessCallback = async (req, res) =>
  handlePayuBrowserCallback(req, res, true);

export const payuFailureCallback = async (req, res) =>
  handlePayuBrowserCallback(req, res, false);

export const payuRedirectToCheckout = async (req, res) => {
  try {
    const forceForm = String(req.query.form || "").toLowerCase() === "true";
    const { redirectLocation, html } =
      await payuService.preparePayuRedirectForBooking(
        req.params.id,
        req.user,
        { forceForm }
      );

    setPayuCheckoutPageHeaders(res);

    if (redirectLocation) {
      return res.redirect(302, redirectLocation);
    }

    return res.status(200).type("html").send(html);
  } catch (error) {
    logger.error("payuRedirectToCheckout error:", error);
    return errorResponse(error, res);
  }
};
