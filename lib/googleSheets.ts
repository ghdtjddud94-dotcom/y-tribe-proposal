import { google } from 'googleapis';

function getAuth() {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Submission {
  id: string;
  timestamp: string;
  brandName: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
  kakao: string;
  currentAds: string;
  bestAds: string;
  keyProduct: string;
  salesChannel: string;
  salesChannelOther: string;
  promotions: string;
  marketingGoals: string;
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
  meetingStatus: string;
  meetingDate: string;
  meetingTime: string;
}

export interface Slot {
  id: string;
  date: string;
  time: string;
  available: string;
  bookedBy: string;
  bookedSubmissionId: string;
}

export interface Booking {
  id: string;
  submissionId: string;
  slotId: string;
  date: string;
  time: string;
  brandName: string;
  contactName: string;
  email: string;
  bookedAt: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function rowToSubmission(row: string[]): Submission {
  return {
    id: row[0] || '',
    timestamp: row[1] || '',
    brandName: row[2] || '',
    contactName: row[3] || '',
    email: row[4] || '',
    phone: row[5] || '',
    location: row[6] || '',
    kakao: row[7] || '',
    currentAds: row[8] || '',
    bestAds: row[9] || '',
    keyProduct: row[10] || '',
    salesChannel: row[11] || '',
    salesChannelOther: '',
    promotions: row[12] || '',
    marketingGoals: row[13] || '',
    campaignStart: row[14] || '',
    campaignEnd: row[15] || '',
    budget: row[16] || '',
    productUrl: row[17] || '',
    campaignBackground: row[18] || '',
    proposalRequirements: row[19] || '',
    targetInfo: row[20] || '',
    competitors: row[21] || '',
    brandDiff: row[22] || '',
    viralAssetsAvailable: row[23] || '',
    viralAssets: row[24] || '',
    viralAssetsLink: row[25] || '',
    otherNotes: row[26] || '',
    preferredDate: row[27] || '',
    preferredTime: row[28] || '',
    meetingStatus: row[29] || '',
    meetingDate: row[30] || '',
    meetingTime: row[31] || '',
  };
}

function rowToSlot(row: string[]): Slot {
  return {
    id: row[0] || '',
    date: row[1] || '',
    time: row[2] || '',
    available: row[3] || 'true',
    bookedBy: row[4] || '',
    bookedSubmissionId: row[5] || '',
  };
}

function rowToBooking(row: string[]): Booking {
  return {
    id: row[0] || '',
    submissionId: row[1] || '',
    slotId: row[2] || '',
    date: row[3] || '',
    time: row[4] || '',
    brandName: row[5] || '',
    contactName: row[6] || '',
    email: row[7] || '',
    bookedAt: row[8] || '',
  };
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export async function getSubmissions(): Promise<Submission[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'submission!A2:AF',
  });
  const rows = res.data.values || [];
  return rows.map((r) => rowToSubmission(r as string[]));
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const all = await getSubmissions();
  return all.find((s) => s.id === id) || null;
}

export async function addSubmission(data: Omit<Submission, 'id' | 'timestamp' | 'meetingStatus' | 'meetingDate' | 'meetingTime'>): Promise<string> {
  const sheets = getSheets();
  const id = `sub_${Date.now()}`;
  const timestamp = new Date().toISOString();

  const row = [
    id,
    timestamp,
    data.brandName,
    data.contactName,
    data.email,
    data.phone,
    data.location,
    data.kakao,
    data.currentAds,
    data.bestAds,
    data.keyProduct,
    data.salesChannel === '기타' ? `기타: ${data.salesChannelOther}` : data.salesChannel,
    data.promotions,
    data.marketingGoals,
    data.campaignStart,
    data.campaignEnd,
    data.budget,
    data.productUrl,
    data.campaignBackground,
    data.proposalRequirements,
    data.targetInfo,
    data.competitors,
    data.brandDiff,
    data.viralAssetsAvailable,
    data.viralAssets,
    data.viralAssetsLink,
    data.otherNotes,
    data.preferredDate,
    data.preferredTime,
    '검토 중',
    '',
    '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'submission!A:AF',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });

  return id;
}

export async function updateMeetingDateTime(submissionId: string, date: string, time: string): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'submission!A:A',
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === submissionId);
  if (rowIndex === -1) return;

  const rowNumber = rowIndex + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `submission!AD${rowNumber}:AF${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['미팅 확정', date, time]] },
  });
}

// ─── Slots ────────────────────────────────────────────────────────────────────

export async function getSlots(): Promise<Slot[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'slots!A2:F',
  });
  const rows = res.data.values || [];
  return rows.map((r) => rowToSlot(r as string[]));
}

export async function addSlot(date: string, time: string): Promise<string> {
  const sheets = getSheets();
  const id = `slot_${Date.now()}`;
  const row = [id, date, time, 'true', '', ''];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'slots!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });

  return id;
}

export async function deleteSlot(slotId: string): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'slots!A:A',
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === slotId);
  if (rowIndex === -1) return;

  const rowNumber = rowIndex + 1;
  // Clear the row instead of deleting to avoid row shifting issues
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `slots!A${rowNumber}:F${rowNumber}`,
  });
}

export async function bookSlot(
  slotId: string,
  submissionId: string,
  info: { brandName: string; contactName: string; email: string; date: string; time: string }
): Promise<string> {
  const sheets = getSheets();

  // Mark slot as unavailable
  const slotsRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'slots!A:A',
  });
  const slotRows = slotsRes.data.values || [];
  const slotRowIndex = slotRows.findIndex((r) => r[0] === slotId);
  if (slotRowIndex !== -1) {
    const slotRowNumber = slotRowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `slots!D${slotRowNumber}:F${slotRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [['false', info.contactName, submissionId]] },
    });
  }

  // Add booking record
  const bookingId = `book_${Date.now()}`;
  const bookingRow = [
    bookingId,
    submissionId,
    slotId,
    info.date,
    info.time,
    info.brandName,
    info.contactName,
    info.email,
    new Date().toISOString(),
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'bookings!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [bookingRow] },
  });

  await updateMeetingDateTime(submissionId, info.date, info.time);

  return bookingId;
}

export async function getBookings(): Promise<Booking[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'bookings!A2:I',
  });
  const rows = res.data.values || [];
  return rows.map((r) => rowToBooking(r as string[]));
}
