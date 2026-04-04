import type { OzonCategoryData, OzonCategoryLevel1, OzonCategoryLevel2 } from '@/types';
import { getEnglishKeyword } from '@/lib/ozon/english-keyword';

export function filterCategoryTree(data: OzonCategoryData, term: string): OzonCategoryData {
  if (!term) return data;
  const t = term.toLowerCase();

  const result: OzonCategoryLevel1[] = [];

  for (const c1 of data) {
    const c1En = getEnglishKeyword(c1.enName, c1.zhName);
    const c1Match = `${c1.ruName} ${c1.zhName} ${c1En}`.toLowerCase().includes(t);
    const nextChildren: OzonCategoryLevel2[] = [];

    for (const c2 of c1.children) {
      const c2En = getEnglishKeyword(c2.enName, c2.zhName);
      const c2Match = `${c2.ruName} ${c2.zhName} ${c2En}`.toLowerCase().includes(t);
      const leaves = (c2.children || []).filter((c3) => {
        const en = getEnglishKeyword(c3.enName, c3.zhName);
        return (
          c3.ruName.toLowerCase().includes(t) ||
          c3.zhName.toLowerCase().includes(t) ||
          en.toLowerCase().includes(t)
        );
      });
      if (c2Match || leaves.length > 0) {
        nextChildren.push({ ...c2, children: leaves });
      }
    }

    if (c1Match || nextChildren.length > 0) {
      result.push({ ...c1, children: nextChildren });
    }
  }

  return result;
}

export function countCategoryStats(data: OzonCategoryData) {
  let level2 = 0;
  let level3 = 0;
  for (const c1 of data) {
    for (const c2 of c1.children) {
      level2++;
      level3 += c2.children?.length ?? 0;
    }
  }
  return { level1: data.length, level2, level3 };
}
