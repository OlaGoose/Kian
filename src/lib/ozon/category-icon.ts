const KEYWORDS: { keys: string[]; symbol: string }[] = [
  { keys: ['电子产品'], symbol: '💻' },
  { keys: ['服装鞋帽'], symbol: '👔' },
  { keys: ['家居用品'], symbol: '🏠' },
  { keys: ['美妆护肤'], symbol: '💄' },
  { keys: ['食品饮料'], symbol: '🍔' },
  { keys: ['母婴用品'], symbol: '👶' },
  { keys: ['运动户外'], symbol: '⚽' },
  { keys: ['图书文具'], symbol: '📚' },
  { keys: ['汽车用品'], symbol: '🚗' },
  { keys: ['宠物用品'], symbol: '🐾' },
  { keys: ['珠宝配饰'], symbol: '💎' },
  { keys: ['健康保健'], symbol: '💊' },
  { keys: ['玩具游戏'], symbol: '🎮' },
  { keys: ['办公用品'], symbol: '📎' },
  { keys: ['园艺工具'], symbol: '🌱' },
  { keys: ['建材五金'], symbol: '🔧' },
  { keys: ['家具'], symbol: '🛋️' },
  { keys: ['家电'], symbol: '⚡' },
  { keys: ['乐器'], symbol: '🎸' },
  { keys: ['艺术品'], symbol: '🎨' },
  { keys: ['收藏品'], symbol: '🏺' },
  { keys: ['礼品'], symbol: '🎁' },
  { keys: ['工业用品'], symbol: '🏭' },
  { keys: ['农业用品'], symbol: '🌾' },
  { keys: ['其他'], symbol: '📦' },
];

export function getCategoryIcon(name: string): string {
  for (const { keys, symbol } of KEYWORDS) {
    for (const key of keys) {
      if (name.includes(key) || key.includes(name)) {
        return symbol;
      }
    }
  }
  return '📦';
}
