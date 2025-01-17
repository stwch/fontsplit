import { resolve } from 'path';
import { fontkit } from './const.js';

interface ExtractOptions {
  fontPath: string;
}
export function extractFontData({ fontPath }: ExtractOptions) {
  const newFont = fontkit.openSync(resolve(fontPath));

  const family = newFont.name?.records?.fontFamily?.en as string | undefined;
  const subFamily = newFont.name?.records?.fontSubfamily?.en as string | undefined;
  const fullFamliy = newFont.name?.records?.fullName?.en as string | undefined;
  const localFamliy = newFont.postscriptName as string;
  const codePoints = newFont.characterSet as number[];

  let weight: string;
  if (newFont.fvar) {
    //バリアブルフォントの場合
    const axis = newFont.fvar.axis.find((data: any) => data.axisTag === 'wght');
    weight = `${axis.minValue}-${axis.maxValue}`;
  } else {
    weight = newFont['OS/2']?.usWeightClass;
  }

  return {
    familyNames: {
      main: family,
      sub: subFamily,
      full: fullFamliy,
      local: localFamliy,
    },
    weightValue: weight,
    codePoints,
  };
}
