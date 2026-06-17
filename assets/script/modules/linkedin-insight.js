// LinkedIn Insight Tag
// Powers LinkedIn ad attribution, conversion tracking, and audience retargeting.
// Set LINKEDIN_PARTNER_ID below to the Partner ID from LinkedIn Campaign Manager
// (Account Assets, Insight Tag). Leave empty to disable.
// https://www.linkedin.com/help/lms/answer/a427660

const LINKEDIN_PARTNER_ID = '9341076';

export function initLinkedInInsight() {
    if (!LINKEDIN_PARTNER_ID) return;

    window._linkedin_partner_id = LINKEDIN_PARTNER_ID;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);

    if (!window.lintrk) {
        window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
        window.lintrk.q = [];
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    // noscript fallback pixel for users with JS disabled
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.alt = '';
    img.src = `https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_PARTNER_ID}&fmt=gif`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);
}
