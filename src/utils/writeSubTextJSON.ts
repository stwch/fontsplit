import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { subtextFileName } from './const.js';

function writeSubTextJSON() {
  // 外部ファイルのパスを指定
  const filePath = resolve(process.cwd(), 'src/data/google-font-face_notosansjp_2025-01-11.txt');
  const outputFilePath = resolve(process.cwd(), `src/data/${subtextFileName}`);

  // ファイルを読み込む
  const cssText = readFileSync(filePath, 'utf-8');

  const unicodeRanges = extractUnicodeRangesFromFontface(cssText) as string[];
  const subTexts = unicodeRanges.map(unicodeRange => unicodeRangeToString(unicodeRange));

  // 結果をJSONファイルに出力
  writeFileSync(outputFilePath, JSON.stringify(subTexts, null, 2), 'utf-8');
}

// unicode-rangeを文字列に変換
function unicodeRangeToString(unicodeRange: string): string {
  const ranges = unicodeRange.split(',').map(range => range.trim());
  let result = '';

  for (const range of ranges) {
    const match = range.match(/^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/);
    if (!match) {
      throw new Error(`Invalid unicode-range format: ${range}`);
    }

    const start = parseInt(match[1], 16);
    const end = match[2] ? parseInt(match[2], 16) : start;

    for (let codePoint = start; codePoint <= end; codePoint++) {
      result += String.fromCodePoint(codePoint);
    }
  }
  return result;
}

// unicode-rangeを抽出
function extractUnicodeRangesFromFontface(css: string): string[] {
  const regex = /unicode-range:\s*([^;]+);/g;
  return Array.from(css.matchAll(regex), match => match[1].trim());
}

writeSubTextJSON();
