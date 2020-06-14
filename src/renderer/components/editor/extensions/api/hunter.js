import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

const HUNTER_API_URL = 'https://api.hunter.io/v2'
const HUNTER_API_KEY = 'ca417c3ddfa802e32c8d718d0844f4a14bc23310'

const api = {
  name: 'hunter',
  alias: 'hunt',
}

const fetchHunter = (domain) =>
  fetch(
    `${HUNTER_API_URL}/domain-search?domain=${domain}&api_key=${HUNTER_API_KEY}`,
    { method: 'GET' }
  ).then((r) => r.json())

export default class Hunter extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(
        new RegExp(`w*/${api.alias}$`),
        (state, match, start, end) => {
          const domain = match.input.slice(0, -api.alias.length - 1)

          fetchHunter(domain).then(({ data: { emails = [] } = {} }) => {
            const e = emails.map((email) => email.value).join(', ')
            this.editor.view.dispatch(
              this.editor.view.state.tr.insertText(`: ${e}`)
            )
          })

          return state.tr
            .insertText('', end - api.alias.length, end)
            .setMeta('api-call', {
              api: api.name,
              domain,
            })
        }
      ),
    ]
  }
}
