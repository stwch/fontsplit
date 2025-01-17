import { readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { extractFontData } from './createFontInfo.js';

type FontCssOptions = {
  outPath: string;
  local?: boolean;
  fileName?: string;
} & Omit<FontfaceOptions, 'fontFileName' | 'localName' | 'unicodeRange'>;
export function writeFontCss({ outPath, publicDir, local, family, weight, style, fileName }: FontCssOptions): void {
  const splitedFontDir = resolve(outPath, publicDir);
  const fileNames = _getAllFileNamesInDir(splitedFontDir);
  //フォントファイルからcssを生成
  const css = fileNames.reduce<string>((accu, fileName) => {
    const fontInfo = extractFontData({ fontPath: resolve(splitedFontDir, fileName) });
    const { familyNames, weightValue, codePoints } = fontInfo;

    _validFontProp(familyNames.main, weightValue);

    const unicodeRange = _createUnicodeRage(codePoints);
    const fontface = _createFontface({
      fontFileName: fileName,
      unicodeRange,
      publicDir,
      style,
      localName: local ?? familyNames.local,
      family: family ?? familyNames.main,
      weight: weight ?? weightValue,
    });
    accu += fontface;
    return accu;
  }, '');

  const cssFileName = `${fileName}.css`;
  const cssSizeKB = _getStringSizeInKB(css);
  //ログと出力
  console.log(`\n${cssFileName}: ${cssSizeKB} KB`);
  writeFileSync(resolve(outPath, cssFileName), css, 'utf-8');
}

type FontProp = string | undefined;
function _validFontProp(family: FontProp, weight: FontProp): void {
  if (!family) throw new Error('ファイルに font-family が無いので -f, --family オプションの設定が必要です。');
  if (!weight) throw new Error('ファイルに font-weight が無いので -w, --weight オプションの設定が必要です。');
}

function _getStringSizeInKB(string: string): number {
  const byteSize = Buffer.byteLength(string, 'utf8');
  // バイトサイズをKBに変換（小数点以1桁で丸める）
  const sizeInKB = byteSize / 1024;
  return Math.round(sizeInKB * 10) / 10;
}

function _getAllFileNamesInDir(dirPath: string): string[] {
  try {
    const files = readdirSync(dirPath);
    return files;
  } catch (error) {
    throw new Error(`writeFontCss: ディレクトリを読み取れませんでした。`);
  }
}

interface FontfaceOptions {
  fontFileName: string;
  family: string;
  publicDir: string;
  weight?: string;
  style: string;
  localName: string | boolean;
  unicodeRange?: string;
}
export function _createFontface({
  fontFileName,
  family,
  publicDir,
  weight,
  style,
  localName,
  unicodeRange,
}: FontfaceOptions): string {
  const fontWeight = weight ? `font-weight:${weight};` : '';
  const local = localName ? `local('${localName}'),` : '';
  return `@font-face{font-family:'${family}';font-style:${style};${fontWeight}font-display:swap;src:${local}url(/${publicDir}/${fontFileName})format('woff2');unicode-range:${unicodeRange};}`;
}

//非文字を含まない unicode-range を生成
function _createUnicodeRage(codePoints: number[]): string {
  const groupedCodePoints = _groupSequentialNumbers(codePoints);
  return groupedCodePoints.reduce((accu: string, _codePoints: number[], i) => {
    const isSequential = _codePoints.length !== 1;
    const startUnicide = _codePoints[0].toString(16);

    let unicode;
    if (isSequential) {
      const endUnicode = _codePoints[_codePoints.length - 1].toString(16);
      unicode = `U+${startUnicide}-${endUnicode}`;
    } else {
      unicode = `U+${startUnicide}`;
    }
    //非文字を除外
    const nonCharRemovedUnicode = _removeNonCharUnicode(unicode);

    if (!nonCharRemovedUnicode) return accu;
    const needComma = accu !== '';
    accu += needComma ? `,${nonCharRemovedUnicode}` : nonCharRemovedUnicode;
    return accu;
  }, '');
}

function _groupSequentialNumbers(numbers: number[]): number[][] {
  if (numbers.length === 0) return [];

  const result: number[][] = [];
  let currentGroup: number[] = [numbers[0]];

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === numbers[i - 1] + 1) {
      // 連番なら現在のグループに追加
      currentGroup.push(numbers[i]);
    } else {
      // 連番じゃない場合、現在のグループを結果に追加して新しいグループを開始
      result.push(currentGroup);
      currentGroup = [numbers[i]];
    }
  }

  // 最後のグループを結果に追加
  result.push(currentGroup);

  return result;
}

function _isNonCharacter(codePoint: number): boolean {
  return (
    (codePoint >= 0xfdd0 && codePoint <= 0xfdef) || // 非文字の予約範囲
    (codePoint & 0xffff) === 0xfffe || // 各プレーンの最後の2つ
    (codePoint & 0xffff) === 0xffff
  );
}

function _removeNonCharUnicode(unicodeRange: string): string | null {
  // 正規表現でunicode-rangeの形式をパース
  const rangePattern = /U\+([0-9A-Fa-f]{1,6})(?:-([0-9A-Fa-f]{1,6}))?/g;
  const matches = Array.from(unicodeRange.matchAll(rangePattern));

  const resultRanges: string[] = matches.flatMap(match => {
    const start = parseInt(match[1], 16);
    const end = match[2] ? parseInt(match[2], 16) : start;

    const validRanges = Array.from({ length: end - start + 1 }, (_, i) => start + i)
      .filter(codePoint => !_isNonCharacter(codePoint))
      .reduce<number[][]>((acc, codePoint) => {
        if (acc.length === 0 || acc[acc.length - 1][1] + 1 !== codePoint) {
          acc.push([codePoint, codePoint]);
        } else {
          acc[acc.length - 1][1] = codePoint;
        }
        return acc;
      }, [])
      .map(([rangeStart, rangeEnd]) =>
        rangeStart === rangeEnd
          ? `U+${rangeStart.toString(16).toUpperCase()}`
          : `U+${rangeStart.toString(16).toUpperCase()}-${rangeEnd.toString(16).toUpperCase()}`,
      );

    return validRanges;
  });

  const removed = resultRanges.join(',');
  return removed === '' ? null : removed;
}
