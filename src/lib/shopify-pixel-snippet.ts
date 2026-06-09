export const SHOPIFY_PIXEL_SNIPPET = `// ---- OpenAI Pixel init ----
console.log("OpenAI test: pixel code loaded");

!function(w, d, s, u) {
  if (w.oaiq) return;
  var q = function() { q.q.push(arguments); };
  q.q = [];
  w.oaiq = q;
  var j = d.createElement(s);
  j.async = 1;
  j.src = u;
  var f = d.getElementsByTagName(s)[0];
  f.parentNode.insertBefore(j, f);
}(window, document, "script", "https://bzrcdn.openai.com/sdk/oaiq.min.js");

oaiq("init", {
  pixelId: "YOUR_PIXEL_ID_HERE",
  debug: false
});
console.log("OpenAI test: init called");

// ---- View Content -> contents_viewed ----
analytics.subscribe("product_viewed", (event) => {
  const variant = event.data.productVariant;
  const product = variant?.product;
  const price = Number(variant?.price?.amount || 0);
  const currency = variant?.price?.currencyCode || "USD";
  const payload = {
    type: "contents",
    amount: Math.round(price * 100),
    currency: currency,
    contents: [{
      id: String(variant?.id || product?.id || ""),
      name: String(product?.title || variant?.title || ""),
      content_type: "product",
      quantity: 1
    }]
  };
  console.log("OpenAI test: firing contents_viewed", payload);
  oaiq("measure", "contents_viewed", payload);
});

// ---- Add to Cart -> items_added ----
analytics.subscribe("product_added_to_cart", (event) => {
  const line = event.data.cartLine;
  const merchandise = line?.merchandise;
  const quantity = Number(line?.quantity || 1);
  const price = Number(merchandise?.price?.amount || 0);
  const currency = merchandise?.price?.currencyCode || "USD";
  const lineValue = Math.round(price * quantity * 100);
  const payload = {
    type: "contents",
    amount: lineValue,
    currency: currency,
    contents: [{
      id: String(merchandise?.id || ""),
      name: String(
        merchandise?.product?.title ||
        merchandise?.title ||
        merchandise?.sku ||
        ""
      ),
      content_type: "product",
      quantity: quantity
    }]
  };
  console.log("OpenAI test: firing items_added", payload);
  oaiq("measure", "items_added", payload);
});

// ---- Initiate Checkout -> checkout_started ----
analytics.subscribe("checkout_started", (event) => {
  const checkout = event.data.checkout;
  const total = Number(checkout?.totalPrice?.amount || 0);
  const currency = checkout?.totalPrice?.currencyCode || "USD";
  const contents = (checkout?.lineItems || []).map((item) => ({
    id: String(item?.variant?.id || item?.id || ""),
    name: String(item?.title || item?.variant?.title || ""),
    content_type: "product",
    quantity: Number(item?.quantity || 1)
  }));
  const payload = {
    type: "contents",
    amount: Math.round(total * 100),
    currency: currency,
    contents: contents
  };
  console.log("OpenAI test: firing checkout_started", payload);
  oaiq("measure", "checkout_started", payload);
});

// ---- Purchase -> order_created ----
analytics.subscribe("checkout_completed", (event) => {
  const checkout = event.data.checkout;
  const total = Number(checkout?.totalPrice?.amount || 0);
  const currency = checkout?.totalPrice?.currencyCode || "USD";
  const contents = (checkout?.lineItems || []).map((item) => ({
    id: String(item?.variant?.id || item?.id || ""),
    name: String(item?.title || item?.variant?.title || ""),
    content_type: "product",
    quantity: Number(item?.quantity || 1)
  }));
  const payload = {
    type: "contents",
    amount: Math.round(total * 100),
    currency: currency,
    contents: contents
  };
  const options = {
    event_id: String(checkout?.order?.id || checkout?.token || Date.now())
  };
  console.log("OpenAI test: firing order_created", payload, options);
  oaiq("measure", "order_created", payload, options);
});
`;

export const CONVERSION_STEPS = [
  {
    key: "open_tools_conversions",
    title: "Open Ads Manager → Tools → Conversions",
    body: "In OpenAI Ads Manager, click Tools in the sidebar, then choose Conversions.",
  },
  {
    key: "create_data_source",
    title: "Create a data source & your first pixel",
    body: "Under Data Sources, click Create data source, then create your first pixel. Copy the Pixel ID — you'll paste it into the snippet below.",
  },
  {
    key: "create_conversion_events",
    title: "Add the order_created conversion event",
    body: "Go to Conversion Events, attach it to your data source, and track order_created (Purchase).",
  },
  {
    key: "shopify_custom_pixel",
    title: "Shopify → Customer Events → add a custom pixel",
    body: "In your Shopify admin, open Settings → Customer Events, click Add custom pixel, name it (e.g. OpenAI Ads), and paste the code below.",
  },
  {
    key: "replace_pixel_id",
    title: "Replace YOUR_PIXEL_ID_HERE with your Pixel ID",
    body: "Swap YOUR_PIXEL_ID_HERE in the snippet for the Pixel ID you copied in step 2, then click Save & Connect in Shopify.",
  },
  {
    key: "test",
    title: "Test a conversion",
    body: "Place a test order. Open the browser console to see the 'OpenAI test:' logs, then confirm the event appears in OpenAI Ads Manager within ~30 seconds.",
  },
] as const;