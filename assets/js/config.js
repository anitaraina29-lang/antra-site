/* =========================================================
   ANTRA — site configuration
   Edit the values below to change contact / ordering links.
   ========================================================= */
window.ANTRA_CONFIG = {
  brand: "ANTRA",
  tagline: "Botanical perfume oils & ritual skincare",
  email: "antra.fem@gmail.com",

  // Instagram handle WITHOUT the @  (set to "" to hide the Instagram links)
  instagram: "antra.fem",

  // WhatsApp number in international format, digits only, e.g. "919876543210".
  // Leave "" to hide the WhatsApp order button (the Email order button always shows).
  whatsapp: "",

  // Where the brand ships from / is based (shown in footer). Edit as needed.
  location: "Handcrafted in small batches • India",

  currency: "₹",

  // Pay4U online payment.
  //  - Set enabled:true only when the Pay4U backend (the "server" folder) is running.
  //  - endpoint is where the site sends the "Pay Now" click (the backend's /api/pay).
  //    Leave "/api/pay" when the site is served BY that backend (recommended).
  pay4u: {
    // Turn back to true once the real Pay4U endpoint + keys are set in Netlify.
    // While false, products show Email/WhatsApp order buttons instead of "Pay Now".
    enabled: false,
    endpoint: "/api/pay"
  }
};
