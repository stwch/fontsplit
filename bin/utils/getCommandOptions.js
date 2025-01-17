import { program } from 'commander';
export function getCommandOptions() {
    program
        .name('fontsplit')
        .requiredOption('-t, --target <path>', 'フォントファイルのパス')
        .option('-f, --family <string>', '@font-face の font-family。指定しない場合はフォントファイルから取得します')
        .option('-n, --font-name <string>', '生成されるフォントファイル名。指定しない場合は元のファイル名を使用します')
        .option('-c, --css-name <string>', '生成される css ファイル名', 'font')
        .option('-o, --output <path>', '出力ディレクトリ', 'splited')
        .option('-p, --public-dir <string>', 'フォントファイルを配置するディレクトリ名。@font-face の url(/path/fontfile) の path に該当します', 'fonts')
        .option('-w, --weight <string>', '@font-face の font-weight。指定しない場合はフォントファイルから取得します')
        .option('-s, --style <string>', '@font-faceの font-style', 'normal')
        .option('-l, --local', '@font-face の src に local(fontname) を追加します。fontname はフォントファイルから取得します')
        .option('-r, --trial', 'サブセットする文字を大幅に減らして出力します。出力内容をチェックしたいときに便利です')
        .option('-i, --info', 'フォントファイルの情報をログに出力します。このオプションを設定しているとサブセット処理はスキップされます。');
    program.parse(process.argv);
    const options = program.opts();
    return {
        fontFile: options.target,
        family: options.family,
        customName: {
            font: options.fontName,
            css: options.cssName,
        },
        publicDir: options.publicDir,
        output: options.output,
        weight: options.weight,
        style: options.style,
        local: options.local,
        trial: options.trial,
        info: options.info,
    };
}
