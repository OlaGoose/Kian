export function getEnglishKeyword(enName: string | undefined, zhName: string): string {
  if (enName?.trim()) return enName.trim();
  return zhName.replace(/[\u4e00-\u9fa5]/gu, '').trim() || zhName;
}
