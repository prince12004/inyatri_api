import crypto from "crypto";

const PAYU_CALLBACK_PLACEHOLDER_HOSTS = ["your-api.com", "example.com"];

const resolvePayuCallbackUrl = (explicitUrl, pathSuffix) => {
  const baseUrl = (process.env.BASE_URL || "http://localhost:5000").replace(
    /\/$/,
    ""
  );
  const fallback = `${baseUrl}${pathSuffix}`;

  if (!explicitUrl) {
    return fallback;
  }

  try {
    const hostname = new URL(explicitUrl).hostname.toLowerCase();
    if (PAYU_CALLBACK_PLACEHOLDER_HOSTS.includes(hostname)) {
      return fallback;
    }
    return explicitUrl;
  } catch {
    return fallback;
  }
};

const getPayuConfig = () => ({
  key: process.env.PAYU_MERCHANT_KEY || "",
  salt: process.env.PAYU_MERCHANT_SALT || "",
  env: process.env.PAYU_ENV || "test",
  successUrl: resolvePayuCallbackUrl(
    process.env.PAYU_SUCCESS_URL,
    "/api/user/v1/payments/payu/success"
  ),
  failureUrl: resolvePayuCallbackUrl(
    process.env.PAYU_FAILURE_URL,
    "/api/user/v1/payments/payu/failure"
  ),
});

export const getPayuPaymentUrl = () => {
  const { env } = getPayuConfig();
  return env === "production"
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";
};

export const generatePayuRequestHash = ({
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = "",
  udf2 = "",
  udf3 = "",
  udf4 = "",
  udf5 = "",
}) => {
  const { key, salt } = getPayuConfig();
  // PayU: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
  const hashString = [
    key,
    String(txnid).trim(),
    Number(amount).toFixed(2),
    String(productinfo).trim(),
    String(firstname).trim(),
    String(email).trim(),
    String(udf1 ?? ""),
    String(udf2 ?? ""),
    String(udf3 ?? ""),
    String(udf4 ?? ""),
    String(udf5 ?? ""),
    "",
    "",
    "",
    "",
    "",
    salt,
  ].join("|");

  return crypto.createHash("sha512").update(hashString).digest("hex");
};

const normalizePayuField = (value) =>
  value === undefined || value === null ? "" : String(value);

export const buildPayuReverseHashString = (payload, salt) => {
  const additionalCharges =
    payload.additionalCharges ??
    payload.additional_charges ??
    payload.additionalcharges ??
    "";

  const segments = [
    salt,
    normalizePayuField(payload.status),
    "",
    "",
    "",
    "",
    "",
    normalizePayuField(payload.udf5),
    normalizePayuField(payload.udf4),
    normalizePayuField(payload.udf3),
    normalizePayuField(payload.udf2),
    normalizePayuField(payload.udf1),
    normalizePayuField(payload.email),
    normalizePayuField(payload.firstname),
    normalizePayuField(payload.productinfo),
    Number(payload.amount).toFixed(2),
    normalizePayuField(payload.txnid),
    normalizePayuField(payload.key),
  ];

  if (additionalCharges !== "" && additionalCharges !== null) {
    return [normalizePayuField(additionalCharges), ...segments].join("|");
  }

  return segments.join("|");
};

export const generatePayuResponseHash = (payload) => {
  const { salt } = getPayuConfig();
  const hashString = buildPayuReverseHashString(payload, salt);
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

export const verifyPayuResponseHash = (payload) => {
  const { salt, key: merchantKey } = getPayuConfig();
  const receivedHash = normalizePayuField(payload.hash).toLowerCase();

  if (!receivedHash) return false;

  if (payload.key && merchantKey && payload.key !== merchantKey) {
    return false;
  }

  const expectedHash = generatePayuResponseHash(payload);
  if (expectedHash.toLowerCase() === receivedHash) {
    return true;
  }

  // Some PayU responses send amount without strict 2-decimal formatting in hash input
  const amountVariants = [
    Number(payload.amount).toFixed(2),
    String(payload.amount),
    Number(payload.amount).toString(),
  ];
  for (const amountStr of amountVariants) {
    const variantPayload = { ...payload, amount: amountStr };
    const variantHash = buildPayuReverseHashString(variantPayload, salt);
    const digest = crypto.createHash("sha512").update(variantHash).digest("hex");
    if (digest.toLowerCase() === receivedHash) {
      return true;
    }
  }

  return false;
};

/** PayU POSTs application/x-www-form-urlencoded; merge body + query defensively. */
export const extractPayuCallbackPayload = (req) => ({
  ...(req.query || {}),
  ...(req.body || {}),
});

export const getPayuPostserviceUrl = () => {
  const { env } = getPayuConfig();
  return env === "production"
    ? "https://info.payu.in/merchant/postservice?form=2"
    : "https://test.payu.in/merchant/postservice?form=2";
};

export const generatePayuVerifyPaymentHash = (txnid) => {
  const { key, salt } = getPayuConfig();
  const command = "verify_payment";
  const hashString = [key, command, txnid, salt].join("|");
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

/** Server-to-server status check (PayU recommended when browser callback fails). */
export const fetchPayuTransactionStatus = async (txnid) => {
  const { key } = getPayuConfig();
  if (!key || !txnid) {
    throw new Error("PayU is not configured or txnid is missing");
  }

  const body = new URLSearchParams({
    key,
    command: "verify_payment",
    var1: String(txnid),
    hash: generatePayuVerifyPaymentHash(txnid),
  });

  const response = await fetch(getPayuPostserviceUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch {
    return { status: 0, msg: raw };
  }
};

export const parsePayuVerifyPaymentResponse = (apiResponse, txnid) => {
  if (
    apiResponse &&
    (apiResponse.status === 0 ||
      apiResponse.status === "0" ||
      String(apiResponse.status).toLowerCase() === "failed")
  ) {
    return {
      status: "api_error",
      error: apiResponse.msg || apiResponse.message || "PayU verify_payment failed",
    };
  }

  const txKey = String(txnid);
  const bucket = apiResponse?.transaction_details;
  let details =
    bucket?.[txKey] ??
    bucket?.[txnid];

  if (!details && bucket && typeof bucket === "object") {
    const entry = Object.entries(bucket).find(
      ([key]) => key.toLowerCase() === txKey.toLowerCase()
    );
    details = entry?.[1];
    if (!details && Object.keys(bucket).length === 1) {
      details = Object.values(bucket)[0];
    }
  }

  if (!details) {
    return null;
  }

  const status = String(details.status || "").toLowerCase();
  const amount =
    details.transaction_amount ??
    details.amt ??
    details.amount ??
    details.net_amount_debit;

  return {
    status,
    amount: amount != null ? Number(amount).toFixed(2) : null,
    mihpayid: details.mihpayid ?? null,
    bank_ref_num: details.bank_ref_num ?? null,
    productinfo: details.productinfo ?? "",
    firstname: details.firstname ?? "",
    email: details.email ?? "",
    txnid: details.txnid ?? txnid,
    key: apiResponse?.key ?? getPayuConfig().key,
    raw: details,
  };
};

export const buildPayuCheckoutPayload = ({
  booking,
  user,
  txnid,
}) => {
  const config = getPayuConfig();
  const firstname =
    [user.firstname, user.lastname].filter(Boolean).join(" ").trim() ||
    user.mobile ||
    "Customer";
  const email = user.email || `${user.mobile}@inyatri.local`;
  const productinfo = `Self Drive Booking ${booking.booking_ref}`;
  const amount = Number(booking.payable_amount).toFixed(2);

  // Hash must match posted fields exactly. PayU test gateway verifies with empty udf
  // when udf fields are omitted; booking is resolved on callback via txnid.
  const udf1 = String(booking.id);

  const hash = generatePayuRequestHash({
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
  });

  return {
    payment_url: getPayuPaymentUrl(),
    key: config.key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone: user.mobile,
    udf1,
    surl: config.successUrl,
    furl: config.failureUrl,
    service_provider: "payu_paisa",
    hash,
  };
};

export const isPayuSuccessStatus = (status) =>
  String(status || "").toLowerCase() === "success";

export const isPayuCancelledStatus = (status, errorMessage = "") => {
  const normalized = String(status || "").toLowerCase();
  const message = String(errorMessage || "").toLowerCase();
  return (
    normalized === "cancelled" ||
    normalized === "usercancelled" ||
    message.includes("cancel")
  );
};

export const isDevPaymentToolsEnabled = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "localhost" || env === "development";
};

export const getApiBaseUrl = () =>
  process.env.BASE_URL || "http://localhost:5000";

/** Dev/local: one-click browser URL after checkout (includes JWT for ?token= auth) */
export const buildDevPayuRedirectUrl = (bookingId, accessToken) => {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  return `${baseUrl}/api/user/v1/payments/payu/redirect/${bookingId}?token=${encodeURIComponent(accessToken)}`;
};

export const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer" && parts[1]) {
    return parts[1];
  }
  return null;
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const PAYU_FORM_FIELDS = [
  "key",
  "txnid",
  "amount",
  "productinfo",
  "firstname",
  "email",
  "phone",
  "udf1",
  "surl",
  "furl",
  "service_provider",
  "hash",
];

export const buildPayuFormBody = (payu) => {
  const params = new URLSearchParams();
  for (const name of PAYU_FORM_FIELDS) {
    params.append(name, payu[name] ?? "");
  }
  return params.toString();
};

/** Server-side POST to PayU; returns redirect URL when PayU responds with 302 */
export const resolvePayuRedirectLocation = async (payu) => {
  const response = await fetch(getPayuPaymentUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: buildPayuFormBody(payu),
    redirect: "manual",
  });

  if (response.status < 300 || response.status >= 400) {
    return null;
  }

  const location = response.headers.get("location");
  if (!location) {
    return null;
  }

  return location.startsWith("http")
    ? location
    : new URL(location, getPayuPaymentUrl()).href;
};

/** Minimal headers for dev PayU redirect (Helmet is skipped on this route in app.js) */
export const setPayuCheckoutPageHeaders = (res) => {
  res.removeHeader("Content-Security-Policy");
  res.removeHeader("Content-Security-Policy-Report-Only");
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
};

export const buildPayuCheckoutFormHtml = (payu) => {
  const inputs = PAYU_FORM_FIELDS.map(
    (name) =>
      `<input type="hidden" name="${name}" value="${escapeHtml(payu[name] ?? "")}" />`
  ).join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PayU Checkout</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 420px; margin: 48px auto; padding: 0 16px; }
      input[type="submit"] { margin-top: 16px; padding: 12px 20px; font-size: 16px; cursor: pointer; }
      .muted { color: #555; }
    </style>
  </head>
  <body>
    <h2>PayU Checkout</h2>
    <p class="muted">Amount: ₹${escapeHtml(payu.amount)} · Ref: ${escapeHtml(payu.txnid)}</p>
    <p>Click below to open the PayU payment page.</p>
    <form id="payuForm" method="POST" action="${escapeHtml(payu.payment_url)}" accept-charset="UTF-8" target="_top">
      ${inputs}
      <input type="submit" value="Continue to PayU" />
    </form>
  </body>
</html>`;
};
