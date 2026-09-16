// Umami Web Analytics
// Privacy-friendly, cookieless analytics with UTM parameter support.
// Used for campaign-level reporting (LinkedIn ads, etc.) that Vercel's free tier doesn't expose.
// Dashboard: https://cloud.umami.is

const UMAMI_WEBSITE_ID = "6208a214-805b-481d-9678-67e8b98ad3c3";
const UMAMI_SCRIPT_SRC = "https://cloud.umami.is/script.js";

export function initUmami() {
  if (!UMAMI_WEBSITE_ID) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = UMAMI_SCRIPT_SRC;
  script.setAttribute("data-website-id", UMAMI_WEBSITE_ID);
  document.head.appendChild(script);
}
