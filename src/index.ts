#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { asyncSubset } from './utils/asyncSubset.js';
import { subtextFileName } from './utils/const.js';
import { getCommandOptions } from './utils/getCommandOptions.js';
import { viewFontInfo } from './utils/viewFontInfo.js';
import { writeFontCss } from './utils/writeFontCss.js';

//ログ
console.log('[FONT-SPLIT]\n');

const { fontFile, family, publicDir, output, weight, style, local, customName, trial, info } = getCommandOptions();
const subTexts = trial ? ['あいうえお-_・ABCDEFX', 'はまやらわ？!！?GHIJKY'] : _getSubTexts();

if (info) {
  viewFontInfo({ fontPath: fontFile });
  console.log('\n[----------]');
  process.exit(0);
}

_createOutdir(resolve(output, publicDir));

const promises = subTexts.map((text, i) => {
  return asyncSubset({
    fontPath: fontFile,
    outPath: output,
    publicDir,
    text,
    prefix: i + 1,
    customFileName: customName.font,
  });
});
await Promise.all(promises);

writeFontCss({
  family,
  publicDir,
  outPath: output,
  weight,
  style,
  local,
  fileName: customName.css,
});

//ログ
console.log(`\n Done\n → ${resolve(output)}\n`);
console.log('[----------]');

function _getSubTexts() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const filePath = `${__dirname}/data/${subtextFileName}`;
  const json = readFileSync(filePath, 'utf-8');
  return JSON.parse(json) as string[];
}

function _createOutdir(dirPath: string) {
  const directory = resolve(dirPath);
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true }); // 必要なら階層的に作成
  }
}
