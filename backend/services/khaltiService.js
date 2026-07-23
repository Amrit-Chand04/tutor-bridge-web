const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";

const khaltiRequest = async (path, body) => {
  const response = await fetch(`${KHALTI_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || JSON.stringify(data));
  }
  return data;
};

const initiatePayment = ({ amount, purchaseOrderId, purchaseOrderName, returnUrl, websiteUrl, customerInfo }) => {
  return khaltiRequest("/epayment/initiate/", {
    return_url: returnUrl,
    website_url: websiteUrl,
    amount,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: purchaseOrderName,
    customer_info: customerInfo,
  });
};

const lookupPayment = (pidx) => {
  return khaltiRequest("/epayment/lookup/", { pidx });
};

module.exports = { initiatePayment, lookupPayment };
