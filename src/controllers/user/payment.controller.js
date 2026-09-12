import * as payuService from "../../services/payment/payu.service.js";
import { setPayuCheckoutPageHeaders } from "../../utils/payment/payu.util.js";
import { errorResponse } from "../../utils/response.js";
import logger from "../../utils/logger.js";

export const payuSuccessCallback = async (req, res) => {
  try {
    const result = await payuService.handlePayuCallback(req.body);
    res
      .status(200)
      .send(payuService.buildPayuRedirectHtml(result, true));
  } catch (error) {
    logger.error("payuSuccessCallback error:", error);
    return errorResponse(error, res);
  }
};

export const payuFailureCallback = async (req, res) => {
  try {
    const result = await payuService.handlePayuCallback(req.body);
    res
      .status(200)
      .send(payuService.buildPayuRedirectHtml(result, false));
  } catch (error) {
    logger.error("payuFailureCallback error:", error);
    return errorResponse(error, res);
  }
};

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
