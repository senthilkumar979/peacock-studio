/**
 * Canonical UTM values for Peacock marketing links.
 *
 * Template:
 * https://peacock.mentorbridge.in/?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
 *
 * WhatsApp, Telegram, and SMS strip referrers — always use UTMs for those channels.
 */
export const ACQUISITION_UTM_CHANNELS = {
  linkedin: { source: 'linkedin', medium: 'social', exampleCampaign: 'beta_launch_2026' },
  whatsapp: { source: 'whatsapp', medium: 'messaging', exampleCampaign: 'founder_dm' },
  blog: { source: 'blog', medium: 'content', exampleCampaign: 'flow_docs_guide' },
  newsletter: { source: 'newsletter', medium: 'email', exampleCampaign: 'march_update' },
  googleAds: { source: 'google', medium: 'cpc', exampleCampaign: 'doc_tool_search' },
  productHunt: { source: 'producthunt', medium: 'referral', exampleCampaign: 'launch_day' },
  embed: { source: 'embed', medium: 'iframe', exampleCampaign: 'watermark' },
} as const;

export function buildAcquisitionUrl(
  baseUrl: string,
  source: string,
  medium: string,
  campaign: string,
  content?: string,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  if (content) url.searchParams.set('utm_content', content);
  return url.toString();
}
