// Regional reference data used to infer state-level tax and insurance assumptions from ZIP codes.
export interface StateMeta {
  code: string;
  name: string;
  taxRate: number;
  insuranceRate: number;
}

interface ZipRange {
  start: number;
  end: number;
  stateCode: string;
}

export const STATE_META: Record<string, StateMeta> = {
  AL: { code: "AL", name: "Alabama", taxRate: 0.0038, insuranceRate: 0.0058 },
  AK: { code: "AK", name: "Alaska", taxRate: 0.0118, insuranceRate: 0.0027 },
  AZ: { code: "AZ", name: "Arizona", taxRate: 0.0051, insuranceRate: 0.0037 },
  AR: { code: "AR", name: "Arkansas", taxRate: 0.0061, insuranceRate: 0.0066 },
  CA: { code: "CA", name: "California", taxRate: 0.0071, insuranceRate: 0.0030 },
  CO: { code: "CO", name: "Colorado", taxRate: 0.0049, insuranceRate: 0.0036 },
  CT: { code: "CT", name: "Connecticut", taxRate: 0.0180, insuranceRate: 0.0028 },
  DE: { code: "DE", name: "Delaware", taxRate: 0.0057, insuranceRate: 0.0029 },
  FL: { code: "FL", name: "Florida", taxRate: 0.0083, insuranceRate: 0.0069 },
  GA: { code: "GA", name: "Georgia", taxRate: 0.0091, insuranceRate: 0.0045 },
  HI: { code: "HI", name: "Hawaii", taxRate: 0.0028, insuranceRate: 0.0017 },
  ID: { code: "ID", name: "Idaho", taxRate: 0.0063, insuranceRate: 0.0029 },
  IL: { code: "IL", name: "Illinois", taxRate: 0.0208, insuranceRate: 0.0039 },
  IN: { code: "IN", name: "Indiana", taxRate: 0.0082, insuranceRate: 0.0033 },
  IA: { code: "IA", name: "Iowa", taxRate: 0.0157, insuranceRate: 0.0032 },
  KS: { code: "KS", name: "Kansas", taxRate: 0.0133, insuranceRate: 0.0051 },
  KY: { code: "KY", name: "Kentucky", taxRate: 0.0079, insuranceRate: 0.0042 },
  LA: { code: "LA", name: "Louisiana", taxRate: 0.0056, insuranceRate: 0.0088 },
  ME: { code: "ME", name: "Maine", taxRate: 0.0109, insuranceRate: 0.0026 },
  MD: { code: "MD", name: "Maryland", taxRate: 0.0101, insuranceRate: 0.0029 },
  MA: { code: "MA", name: "Massachusetts", taxRate: 0.0106, insuranceRate: 0.0022 },
  MI: { code: "MI", name: "Michigan", taxRate: 0.0136, insuranceRate: 0.0030 },
  MN: { code: "MN", name: "Minnesota", taxRate: 0.0112, insuranceRate: 0.0030 },
  MS: { code: "MS", name: "Mississippi", taxRate: 0.0065, insuranceRate: 0.0060 },
  MO: { code: "MO", name: "Missouri", taxRate: 0.0091, insuranceRate: 0.0041 },
  MT: { code: "MT", name: "Montana", taxRate: 0.0083, insuranceRate: 0.0031 },
  NE: { code: "NE", name: "Nebraska", taxRate: 0.0161, insuranceRate: 0.0047 },
  NV: { code: "NV", name: "Nevada", taxRate: 0.0054, insuranceRate: 0.0030 },
  NH: { code: "NH", name: "New Hampshire", taxRate: 0.0186, insuranceRate: 0.0023 },
  NJ: { code: "NJ", name: "New Jersey", taxRate: 0.0213, insuranceRate: 0.0025 },
  NM: { code: "NM", name: "New Mexico", taxRate: 0.0071, insuranceRate: 0.0036 },
  NY: { code: "NY", name: "New York", taxRate: 0.0161, insuranceRate: 0.0028 },
  NC: { code: "NC", name: "North Carolina", taxRate: 0.0074, insuranceRate: 0.0040 },
  ND: { code: "ND", name: "North Dakota", taxRate: 0.0099, insuranceRate: 0.0034 },
  OH: { code: "OH", name: "Ohio", taxRate: 0.0141, insuranceRate: 0.0032 },
  OK: { code: "OK", name: "Oklahoma", taxRate: 0.0087, insuranceRate: 0.0062 },
  OR: { code: "OR", name: "Oregon", taxRate: 0.0090, insuranceRate: 0.0028 },
  PA: { code: "PA", name: "Pennsylvania", taxRate: 0.0135, insuranceRate: 0.0029 },
  RI: { code: "RI", name: "Rhode Island", taxRate: 0.0136, insuranceRate: 0.0031 },
  SC: { code: "SC", name: "South Carolina", taxRate: 0.0057, insuranceRate: 0.0049 },
  SD: { code: "SD", name: "South Dakota", taxRate: 0.0119, insuranceRate: 0.0039 },
  TN: { code: "TN", name: "Tennessee", taxRate: 0.0064, insuranceRate: 0.0044 },
  TX: { code: "TX", name: "Texas", taxRate: 0.0168, insuranceRate: 0.0057 },
  UT: { code: "UT", name: "Utah", taxRate: 0.0058, insuranceRate: 0.0026 },
  VT: { code: "VT", name: "Vermont", taxRate: 0.0176, insuranceRate: 0.0024 },
  VA: { code: "VA", name: "Virginia", taxRate: 0.0081, insuranceRate: 0.0029 },
  WA: { code: "WA", name: "Washington", taxRate: 0.0087, insuranceRate: 0.0030 },
  WV: { code: "WV", name: "West Virginia", taxRate: 0.0059, insuranceRate: 0.0032 },
  WI: { code: "WI", name: "Wisconsin", taxRate: 0.0142, insuranceRate: 0.0028 },
  WY: { code: "WY", name: "Wyoming", taxRate: 0.0055, insuranceRate: 0.0031 },
  DC: { code: "DC", name: "District of Columbia", taxRate: 0.0056, insuranceRate: 0.0021 },
};

const ZIP_RANGES: ZipRange[] = [
  { start: 10, end: 27, stateCode: "MA" },
  { start: 28, end: 29, stateCode: "RI" },
  { start: 30, end: 38, stateCode: "NH" },
  { start: 39, end: 49, stateCode: "ME" },
  { start: 50, end: 59, stateCode: "VT" },
  { start: 60, end: 69, stateCode: "CT" },
  { start: 70, end: 89, stateCode: "NJ" },
  { start: 100, end: 149, stateCode: "NY" },
  { start: 150, end: 196, stateCode: "PA" },
  { start: 197, end: 199, stateCode: "DE" },
  { start: 200, end: 205, stateCode: "DC" },
  { start: 206, end: 219, stateCode: "MD" },
  { start: 220, end: 246, stateCode: "VA" },
  { start: 247, end: 268, stateCode: "WV" },
  { start: 270, end: 289, stateCode: "NC" },
  { start: 290, end: 299, stateCode: "SC" },
  { start: 300, end: 319, stateCode: "GA" },
  { start: 320, end: 349, stateCode: "FL" },
  { start: 350, end: 369, stateCode: "AL" },
  { start: 370, end: 385, stateCode: "TN" },
  { start: 386, end: 397, stateCode: "MS" },
  { start: 400, end: 427, stateCode: "KY" },
  { start: 430, end: 459, stateCode: "OH" },
  { start: 460, end: 479, stateCode: "IN" },
  { start: 480, end: 499, stateCode: "MI" },
  { start: 500, end: 529, stateCode: "IA" },
  { start: 530, end: 549, stateCode: "WI" },
  { start: 550, end: 567, stateCode: "MN" },
  { start: 570, end: 577, stateCode: "SD" },
  { start: 580, end: 588, stateCode: "ND" },
  { start: 590, end: 599, stateCode: "MT" },
  { start: 600, end: 629, stateCode: "IL" },
  { start: 630, end: 659, stateCode: "MO" },
  { start: 660, end: 679, stateCode: "KS" },
  { start: 680, end: 693, stateCode: "NE" },
  { start: 700, end: 715, stateCode: "LA" },
  { start: 716, end: 729, stateCode: "AR" },
  { start: 730, end: 749, stateCode: "OK" },
  { start: 750, end: 799, stateCode: "TX" },
  { start: 800, end: 816, stateCode: "CO" },
  { start: 820, end: 831, stateCode: "WY" },
  { start: 832, end: 838, stateCode: "ID" },
  { start: 840, end: 847, stateCode: "UT" },
  { start: 850, end: 869, stateCode: "AZ" },
  { start: 870, end: 884, stateCode: "NM" },
  { start: 885, end: 885, stateCode: "TX" },
  { start: 889, end: 898, stateCode: "NV" },
  { start: 900, end: 961, stateCode: "CA" },
  { start: 967, end: 969, stateCode: "HI" },
  { start: 970, end: 979, stateCode: "OR" },
  { start: 980, end: 994, stateCode: "WA" },
  { start: 995, end: 999, stateCode: "AK" }
];

export function inferStateFromZip(zipCode: string): StateMeta | null {
  const digits = zipCode.replace(/\D/g, "").slice(0, 5);
  if (digits.length < 3) {
    return null;
  }

  const prefix = Number(digits.slice(0, 3));
  const match = ZIP_RANGES.find((range) => prefix >= range.start && prefix <= range.end);
  return match ? STATE_META[match.stateCode] : null;
}
