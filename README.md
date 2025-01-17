# fontsplit

フォントファイルを GoogleFonts のように 120 個程のファイルへ分割し、サブセット化します。\
サブセット化したフォントファイルを使用するための fontface 用 css ファイルも同時に生成します。

**現在は、日本語、latin のフォントにのみ対応しています。**

<br />

## インストール

```bash

npm i -D fontsplit

```

<br />

## 使用法

-t, --target オプションにフォントファイルのパスを指定してください。<br />
必要に応じて追加のオプションを指定します。<br />

```bash

fontsplit -t path/to/fontfile

```

<br />

## トライアルモード

-r, --trial オプションを設定することで、サブセットの量を大幅に減らして出力できます。<br />

```bash

fontsplit -t path/to/fontfile -r

```

<br />

## 推奨オプション

- -f, --family: <br />自動で設定されますが、使いづらい名前になる場合があります。<br />
- -n, --font-name: <br />簡潔なファイル名を指定すると、css のファイルサイズを少し小さくできます。<br />
- -p, --public-dir: <br />プロジェクトでフォントファイルを配置するディレクトリを設定してください。デフォルトは 'fonts' に配置されます。<br />
- -l, --local: <br />fontface に local() を設定します。これによりインストール済みのフォントを優先して使用するようになります。近年プリインストールされていることが多いフォント（Noto フォント等）を使う際におすすめです。

<br />

## 出力

```
.
└── output/
    ├── public-dir/
    │   ├── font-name-1.woff2
    │   ├── font-name-2.woff2
    │   └── ...
    └── css-name.css
```

```css
/*css-name.css*/

@font-face {
  font-family: 'family'; /* デフォルト：フォントファイルから自動で取得 */
  font-style: normal; /*デフォルト*/
  font-weight: 200; /* デフォルト：フォントファイルから自動で取得 */
  font-display: swap;
  src: url(/public-dir/font-name-1.woff2)format('woff2');
  unicode-range: U+2D, U+41-46, U+58;
}
@font-face {...
```

<br />

## 使用例

options を変更して実行します。

```bash

node index.js

```

```javascript
//index.js

const family = 'yourfontfamily';
const options = {
  fontFilePath: 'path/to/font',
  family: family,
  resultFontFileName: family,
  cssFileName: family,
  outDirPath: family,
  pubDir: 'fonts/subset',
  local: false,
};

const { main, info, trial } = _createCommands();

//渡したコマンドを実行
//main: サブセットを実行
//info: フォントファイルの情報をログに表示
//trial: トライアルモード で実行
_exec(info);

///////////////////////////////////////////////////////////
const { exec } = require('node:child_process');

function _exec(command) {
  exec(command, (error, stdout) => {
    if (error) throw new Error(`エラー: ${error.message}`);
    console.log(stdout);
  });
}

function _createCommands() {
  const { fontFilePath, family, resultFontFileName, cssFileName, outDirPath, pubDir, local } = options;
  const localFlag = local ? ' -l' : '';
  const mainCommand = `fontsplit -t ${fontFilePath} -f ${family} -n ${resultFontFileName} -c ${cssFileName} -o ${outDirPath} -p ${pubDir}${localFlag}`;
  return {
    main: mainCommand,
    info: `fontsplit -t ${targetPath} -i`,
    trial: `${mainCommand} -r`,
  };
}
```

<br />

## すべてのオプション

-h, --help オプションで表示可能です。

```bash

fontsplit -h

```

```bash

Usage: fontsplit [options]

Options:
  -t, --target <path>        フォントファイルのパス
  -f, --family <string>      @font-face の font-family。指定しない場合はフォントファイルから取得します
  -n, --font-name <string>   生成されるフォントファイル名。指定しない場合は元のファイル名を使用します
  -c, --css-name <string>    生成される css ファイル名 (default: "font")
  -o, --output <path>        出力ディレクトリ (default: "splited")
  -p, --public-dir <string>  フォントファイルを配置するディレクトリ名。@font-face の url(/path/fontfile) の path に該当します (default: "fonts")
  -w, --weight <string>      @font-face の font-weight。指定しない場合はフォントファイルから取得します
  -s, --style <string>       @font-faceの font-style (default: "normal")
  -l, --local                @font-face の src に local(fontname) を追加します。fontname はフォントファイルから取得します
  -r, --trial                サブセットする文字を大幅に減らして出力します。出力内容をチェックしたいときに便利です
  -i, --info                 フォントファイルの情報をログに出力します。このオプションを設定しているとサブセット処理はスキップされます。
  -h, --help                 display help for command

```
