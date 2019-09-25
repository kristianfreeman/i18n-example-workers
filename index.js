import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import parser from 'accept-language-parser'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

const strings = {
  de: {
    title: 'Beispielseite',
    headline: 'Beispielseite',
    subtitle:
      'Dies ist meine Beispielseite. Abhängig davon, wo auf der Welt Sie diese Site besuchen, wird dieser Text in die entsprechende Sprache übersetzt.',
    disclaimer:
      'Haftungsausschluss: Die anfänglichen Übersetzungen stammen von Google Translate, daher sind sie möglicherweise nicht perfekt!',
    tutorial:
      'Das Tutorial für dieses Projekt finden Sie in der Cloudflare Workers-Dokumentation.',
    copyright: 'Design von HTML5 UP.',
  },
  jp: {
    title: 'サンプルサイト',
    headline: 'サンプルサイト',
    subtitle:
      'これは私の例のサイトです。 このサイトにアクセスする世界の場所に応じて、このテキストは対応する言語に翻訳されます。',
    disclaimer:
      '免責事項：最初の翻訳はGoogle翻訳からのものですので、完璧ではないかもしれません！',
    tutorial:
      'Cloudflare Workersのドキュメントでこのプロジェクトのチュートリアルを見つけてください。',
    copyright: 'HTML5 UPによる設計。',
  },
}

class ElementHandler {
  constructor(countryStrings) {
    this.countryStrings = countryStrings
  }

  element(element) {
    const i18nKey = element.getAttribute('data-i18n-key')
    if (i18nKey) {
      const translation = this.countryStrings[i18nKey]
      if (translation) {
        element.setInnerContent(translation)
      }
    }
  }
}

async function handleRequest(event) {
  try {
    const languageHeader = event.request.headers.get('Accept-Language')
    const language = parser.pick(['de', 'jp'], languageHeader)
    const countryStrings = strings[language] || {}

    const response = await getAssetFromKV(event)

    return new HTMLRewriter()
      .on('*', new ElementHandler(countryStrings))
      .transform(response)
  } catch (err) {
    return new Response(err)
  }
}
