import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
const require = createRequire(import.meta.url);
const subsetFont = require('subset-font');
export async function asyncSubset({ text, fontPath, outPath, publicDir, prefix, customFileName, }) {
    const resolvedPath = { font: resolve(fontPath), out: resolve(outPath, publicDir) };
    const font = readFileSync(resolvedPath.font);
    const subsetBuffer = await subsetFont(font, text, { targetFormat: 'woff2' });
    const fileSizeKB = Math.round((subsetBuffer.length / 1024) * 10) / 10;
    //グリフがない場合はファイルを作成しない
    //0～2文字だと1を超えない（0～2文字のサブセットは想定しない）
    if (fileSizeKB < 1)
        return;
    const baseFileName = _extractFileName(resolvedPath.font);
    const newFileName = `${customFileName ?? baseFileName}-${prefix}.woff2`;
    const newFilePath = resolve(resolvedPath.out, newFileName);
    //ログ
    console.log(`${newFileName}: ${fileSizeKB} KB`);
    writeFileSync(newFilePath, subsetBuffer);
}
function _extractFileName(filePath) {
    // パスから最後のスラッシュ以降の部分を取得し、拡張子を除去
    const fileNameWithExtension = filePath.split(/\\|\//).pop() || '';
    return fileNameWithExtension.replace(/\.[^\.]+$/, '');
}
