import { resolve } from 'path';
import { fontkit } from './const.js';
export function extractFontData({ fontPath }) {
    const newFont = fontkit.openSync(resolve(fontPath));
    const family = newFont.name?.records?.fontFamily?.en;
    const subFamily = newFont.name?.records?.fontSubfamily?.en;
    const fullFamliy = newFont.name?.records?.fullName?.en;
    const localFamliy = newFont.postscriptName;
    const codePoints = newFont.characterSet;
    let weight;
    if (newFont.fvar) {
        //バリアブルフォントの場合
        const axis = newFont.fvar.axis.find((data) => data.axisTag === 'wght');
        weight = `${axis.minValue}-${axis.maxValue}`;
    }
    else {
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
