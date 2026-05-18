import { NextRequest, NextResponse } from 'next/server';
import { addSubmission } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      brandName,
      contactName,
      email,
      phone,
      location,
      kakao,
      currentAds,
      bestAds,
      keyProduct,
      salesChannel,
      salesChannelOther,
      promotions,
      marketingGoals,
      campaignStart,
      campaignEnd,
      budget,
      productUrl,
      campaignBackground,
      proposalRequirements,
      targetInfo,
      competitors,
      brandDiff,
      viralAssetsAvailable,
      viralAssets,
      viralAssetsLink,
      otherNotes,
      preferredDate,
      preferredTime,
    } = body;

    // Basic validation
    if (!brandName || !contactName || !email || !phone) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해 주세요.' },
        { status: 400 }
      );
    }

    const id = await addSubmission({
      brandName,
      contactName,
      email,
      phone,
      location: location || '',
      kakao: kakao || '',
      currentAds: currentAds || '',
      bestAds: bestAds || '',
      keyProduct: keyProduct || '',
      salesChannel: salesChannel || '',
      salesChannelOther: salesChannelOther || '',
      promotions: promotions || '',
      marketingGoals: Array.isArray(marketingGoals) ? marketingGoals.join(', ') : marketingGoals || '',
      campaignStart: campaignStart || '',
      campaignEnd: campaignEnd || '',
      budget: budget || '',
      productUrl: productUrl || '',
      campaignBackground: campaignBackground || '',
      proposalRequirements: proposalRequirements || '',
      targetInfo: targetInfo || '',
      competitors: competitors || '',
      brandDiff: brandDiff || '',
      viralAssetsAvailable: viralAssetsAvailable || '',
      viralAssets: viralAssets || '',
      viralAssetsLink: viralAssetsLink || '',
      otherNotes: otherNotes || '',
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || '',
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: '제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
