import { extractFontData } from './createFontInfo.js';
export function viewFontInfo({ fontPath }) {
    const fontInfo = extractFontData({ fontPath });
    const { familyNames, weightValue } = fontInfo;
    console.log('fontfamly: ', familyNames.main);
    console.log('subfamly: ', familyNames.sub);
    console.log('localName: ', familyNames.local);
    console.log('fullName: ', familyNames.full);
    console.log('weight: ', weightValue);
}
