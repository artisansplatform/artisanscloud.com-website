// Vercel Web Analytics
// Privacy-friendly page view + UTM tracking. No cookies, no consent banner needed.
// Requires Web Analytics to be enabled in the Vercel project dashboard.
// https://vercel.com/docs/analytics

import { inject } from '@vercel/analytics';

export function initVercelAnalytics() {
    inject();
}
