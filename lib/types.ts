export interface FormData {
  // Section 1: 기본 정보
  brandName: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  kakao: string;

  // Section 2: 마케팅 현황
  currentAds: string;
  bestAds: string;
  keyProduct: string;
  salesChannel: string;
  salesChannelOther: string;
  promotions: string;
  marketingGoals: string[];

  // Section 3: 제안 요청서
  campaignStart: string;
  campaignEnd: string;
  budget: string;
  productUrl: string;
  campaignBackground: string;
  proposalRequirements: string;
  targetInfo: string;
  competitors: string;
  brandDiff: string;
  viralAssetsAvailable: string;
  viralAssets: string;
  viralAssetsLink: string;
  otherNotes: string;
  preferredDate: string;
  preferredTime: string;
}
