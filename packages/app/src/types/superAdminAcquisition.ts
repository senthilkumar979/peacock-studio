export interface AcquisitionSourceRow {
  source: string;
  signups: number;
}

export interface AcquisitionCampaignRow {
  source: string;
  medium: string;
  campaign: string;
  signups: number;
}

export interface SuperAdminAcquisitionSummary {
  days: number;
  signupsBySource: AcquisitionSourceRow[];
  topCampaigns: AcquisitionCampaignRow[];
  posthogProjectUrl: string;
}
