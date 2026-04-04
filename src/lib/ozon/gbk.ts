type GbkBytePairs = Record<number, [number, number][]>;

let gbkToBytes: GbkBytePairs | null = null;

function buildGbkMap(): GbkBytePairs {
  const map: GbkBytePairs = {};
  for (let b1 = 0x81; b1 <= 0xfe; b1++) {
    for (let b2 = 0x40; b2 <= 0xfe; b2++) {
      if (b2 === 0x7f) continue;
      try {
        const bytes = new Uint8Array([b1, b2]);
        const decoder = new TextDecoder('gb18030');
        const char = decoder.decode(bytes);
        const code = char.codePointAt(0);
        if (code && code < 0x10000) {
          if (!map[code]) map[code] = [];
          map[code].push([b1, b2]);
        }
      } catch {
        /* invalid byte pair */
      }
    }
  }
  return map;
}

export function encodeGBK(str: string): string {
  if (!gbkToBytes) {
    gbkToBytes = buildGbkMap();
  }
  const map = gbkToBytes;
  let result = '';
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (code === undefined) continue;
    const entries = map[code];
    if (entries?.length) {
      const [b1, b2] = entries[0];
      result += `%${b1.toString(16).toUpperCase().padStart(2, '0')}%${b2.toString(16).toUpperCase().padStart(2, '0')}`;
    } else {
      result += encodeURIComponent(ch);
    }
  }
  return result;
}
