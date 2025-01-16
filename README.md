# fontsplit

フォントファイルを GoogleFonts のように 120 個程のファイルへ分割し、サブセット化します。<br />
サブセット化したフォントファイルを使用するために fontface css ファイルも同時に生成します。

## インストール

```bash

npm i -D fontsplit

```

## 使用法

-t, --target オプションにフォントファイルのパスを指定してください。<br />
必要に応じて追加のオプションを指定します。<br />

```bash

fontsplit -t path/to/fontfile

```

## 注意点

現在は、日本語、latin のフォントにのみ対応しています。

## トライアルモード

-r, --trial オプションを設定することで、サブセットの量を大幅に減らして出力できます。<br />

```bash

fontsplit -t path/to/fontfile -r

```

## 推奨オプション

- -f, --family: <br />自動で設定されますが、使いづらい名前になる場合があります。<br />
- -n, --font-name: <br />簡潔なファイル名を指定すると、css のファイルサイズを少し小さくできます。<br />
- -p, --public-dir: <br />プロジェクトでフォントファイルを配置するディレクトリを設定してください。デフォルトは 'fonts' に配置されます。<br />
- -l, --local: <br />fontface に local() を設定します。これによりインストール済みのフォントを優先して使用するようになります。近年プリインストールされていることが多いフォント（Noto フォント等）を使う際におすすめです。

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
  -h, --help                 display help for command

```
