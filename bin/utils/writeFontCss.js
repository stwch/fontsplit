import { readdirSync, writeFileSync } from 'fs';
export function writeFontCss({ outPath, publicDir, local, family, weight, style, fileName }) {
    const splitedFontDir = resolve(outPath, publicDir);
    const fileNames = _getAllFileNamesInDir(splitedFontDir);
    //フォントファイルからcssを生成
    const css = fileNames.reduce((accu, fileName) => {
        const { unicodeRange, localName, familyName, wght } = _createFontInfo({
            fontPath: resolve(splitedFontDir, fileName),
        });
        const fontface = _createFontface({
            fontFileName: fileName,
            localName: local ? localName : undefined,
            family: family ?? familyName,
            publicDir,
            weight: weight ?? wght,
            style,
            unicodeRange,
        });
        accu += fontface;
        return accu;
    }, '');
    const cssFileName = `${fileName}.css`;
    const cssSizeKB = _getStringSizeInKB(css);
    //ログ
    console.log(`\n${cssFileName}: ${cssSizeKB} KB`);
    writeFileSync(resolve(outPath, cssFileName), css, 'utf-8');
}
function _getStringSizeInKB(string) {
    // UTF-8エンコーディングでバイトサイズを取得
    const byteSize = Buffer.byteLength(string, 'utf8');
    // バイトサイズをKBに変換（小数点以1桁で丸める）
    const sizeInKB = byteSize / 1024;
    return Math.round(sizeInKB * 10) / 10;
}
function _getAllFileNamesInDir(dirPath) {
    try {
        const files = readdirSync(dirPath);
        return files;
    }
    catch (error) {
        throw new Error(`writeFontCss: ディレクトリを読み取れませんでした。`);
    }
}
export function _createFontface({ fontFileName, family, publicDir, weight, style, localName, unicodeRange, }) {
    const fontWeight = weight ? `font-weight:${weight};` : '';
    const local = localName ? `local('${localName}'),` : '';
    return `@font-face{font-family:'${family}';font-style:${style};${fontWeight}font-display:swap;src:${local}url(/${publicDir}/${fontFileName})format('woff2');unicode-range:${unicodeRange};}`;
}
import { createRequire } from 'module';
import { resolve } from 'path';
const require = createRequire(import.meta.url);
const fontkit = require('fontkit');
function _createFontInfo({ fontPath }) {
    const newFont = fontkit.openSync(resolve(fontPath));
    const familyName = newFont.name?.records?.fontFamily?.en;
    let wght;
    if (newFont.fvar) {
        //バリアブルフォントの場合
        const axis = newFont.fvar.axis.find((data) => data.axisTag === 'wght');
        wght = `${axis.minValue} ${axis.maxValue}`;
    }
    else {
        wght = newFont['OS/2']?.usWeightClass;
    }
    if (!familyName)
        throw new Error('ファイルからfont-family を取得できませんでした。\n-f, --family オプションの設定が必要です。');
    if (!wght)
        throw new Error('ファイルからfont-weight を取得できませんでした。\n-w, --weight オプションの設定が必要です。');
    //ファイルからunicode-range を取得する
    const groupedCodePoints = _groupSequentialNumbers(newFont.characterSet);
    const unicodeRange = groupedCodePoints.reduce((accu, codePoints, i) => {
        const isSequential = codePoints.length !== 1;
        const startUnicide = codePoints[0].toString(16);
        let unicode;
        if (isSequential) {
            const endUnicode = codePoints[codePoints.length - 1].toString(16);
            unicode = `U+${startUnicide}-${endUnicode}`;
        }
        else {
            unicode = `U+${startUnicide}`;
        }
        const nonCharRemovedUnicode = _removeNonCharUnicode(unicode);
        const isNonChar = nonCharRemovedUnicode === '';
        if (isNonChar)
            return accu;
        const needComma = accu !== '';
        accu += needComma ? `,${nonCharRemovedUnicode}` : nonCharRemovedUnicode;
        return accu;
    }, '');
    return {
        unicodeRange,
        localName: newFont.postscriptName,
        familyName,
        wght,
    };
}
function _groupSequentialNumbers(numbers) {
    if (numbers.length === 0)
        return [];
    const result = [];
    let currentGroup = [numbers[0]];
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === numbers[i - 1] + 1) {
            // 連番なら現在のグループに追加
            currentGroup.push(numbers[i]);
        }
        else {
            // 連番じゃない場合、現在のグループを結果に追加して新しいグループを開始
            result.push(currentGroup);
            currentGroup = [numbers[i]];
        }
    }
    // 最後のグループを結果に追加
    result.push(currentGroup);
    return result;
}
// Unicodeの非文字（noncharacter）を判定する関数
function _isNonCharacter(codePoint) {
    return ((codePoint >= 0xfdd0 && codePoint <= 0xfdef) || // 非文字の予約範囲
        (codePoint & 0xffff) === 0xfffe || // 各プレーンの最後の2つ
        (codePoint & 0xffff) === 0xffff);
}
// unicode-rangeを解析し、非文字を除去したunicode-rangeを返す
function _removeNonCharUnicode(unicodeRange) {
    // 正規表現でunicode-rangeの形式をパース
    const rangePattern = /U\+([0-9A-Fa-f]{1,6})(?:-([0-9A-Fa-f]{1,6}))?/g;
    const matches = Array.from(unicodeRange.matchAll(rangePattern));
    const resultRanges = matches.flatMap(match => {
        const start = parseInt(match[1], 16);
        const end = match[2] ? parseInt(match[2], 16) : start;
        const validRanges = Array.from({ length: end - start + 1 }, (_, i) => start + i)
            .filter(codePoint => !_isNonCharacter(codePoint))
            .reduce((acc, codePoint) => {
            if (acc.length === 0 || acc[acc.length - 1][1] + 1 !== codePoint) {
                acc.push([codePoint, codePoint]);
            }
            else {
                acc[acc.length - 1][1] = codePoint;
            }
            return acc;
        }, [])
            .map(([rangeStart, rangeEnd]) => rangeStart === rangeEnd
            ? `U+${rangeStart.toString(16).toUpperCase()}`
            : `U+${rangeStart.toString(16).toUpperCase()}-${rangeEnd.toString(16).toUpperCase()}`);
        return validRanges;
    });
    return resultRanges.join(',');
}
