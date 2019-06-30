# 🦡 Badger

[![MIT License](https://img.shields.io/github/license/47ng/badger.svg?color=blue)](https://github.com/47ng/badger/blob/master/LICENSE)
[![Travis CI Build](https://img.shields.io/travis/com/47ng/badger.svg)](https://travis-ci.com/47ng/badger)
[![Average issue resolution time](https://isitmaintained.com/badge/resolution/47ng/badger.svg)](https://isitmaintained.com/project/47ng/badger)
[![Number of open issues](https://isitmaintained.com/badge/open/47ng/badger.svg)](https://isitmaintained.com/project/47ng/badger)

Sniff out relevant badges for GitHub repositories.

## Usage

Badger can be used as a CLI: give it a repo slug, it gives you
Markdown back to add to your `README.md`:

```zsh
# Usage: badger <repo slug>
$ npx @47ng/badger franky47/douze
[![MIT License](https://img.shields.io/github/license/franky47/douze.svg?color=blue)](https://github.com/franky47/douze/blob/master/LICENSE)
[![Travis CI Build](https://img.shields.io/travis/com/franky47/douze.svg)](https://travis-ci.com/franky47/douze)
[![Average issue resolution time](https://isitmaintained.com/badge/resolution/franky47/douze.svg)](https://isitmaintained.com/project/franky47/douze)
[![Number of open issues](https://isitmaintained.com/badge/open/franky47/douze.svg)](https://isitmaintained.com/project/franky47/douze)
```

Or you can call it programmatically:

```ts
import { getBadges, renderToMarkdown } from '@47ng/badger'

async function() {
  const badges = await getBadges('47ng/badger')
  console.log(renderToMarkdown(badges))
}
```

## License

[MIT](https://github.com/47ng/badger/blob/master/LICENSE) - Made with ❤️ by [François Best](https://francoisbest.com).
