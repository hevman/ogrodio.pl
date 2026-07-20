import Script from "next/script";

export const googleAnalyticsId = "G-6CCNE44KQ9";

export function GoogleAnalytics() {
  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
gtag('js', new Date());
`,
        }}
        id="google-consent-default"
        strategy="beforeInteractive"
      />
      <Script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var measurementId = '${googleAnalyticsId}';
  var storageKey = 'ogrodio-cookie-consent-v1';

  function getStoredConsent() {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    } catch (error) {
      return null;
    }
  }

  window.ogrodioLoadGoogleAnalytics = function() {
    if (window.__ogrodioGaLoaded) return;
    window.__ogrodioGaLoaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
    gtag('config', measurementId, { anonymize_ip: true });
  };

  var consent = getStoredConsent();
  if (consent && consent.analytics === true) {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: consent.marketing === true ? 'granted' : 'denied',
      ad_user_data: consent.marketing === true ? 'granted' : 'denied',
      ad_personalization: consent.marketing === true ? 'granted' : 'denied'
    });
    window.ogrodioLoadGoogleAnalytics();
  }
})();
`,
        }}
        id="google-analytics-consent-loader"
        strategy="afterInteractive"
      />
    </>
  );
}
