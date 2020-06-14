import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

const api = {
  name: 'crunchbase',
  alias: 'crunch',
}

const fetchCrunchbase = (domain) =>
  fetch(
    `https://crunchbase-crunchbase-v1.p.rapidapi.com/odm-organizations?domain_name=${domain}`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'crunchbase-crunchbase-v1.p.rapidapi.com',
        'x-rapidapi-key': '14b00a912dmshc29f3d5dd244910p17f6a9jsnecfe9e250ed2',
      },
    }
  )
    .then((r) => r.json())
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err)
    })

export default class Crunchbase extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(
        new RegExp(`w*/${api.alias}$`),
        (state, match, start, end) => {
          const domain = match.input.slice(0, -api.alias.length - 1)

          fetchCrunchbase(domain).then(({ data: { items = [] } = {} }) => {
            const item = items[0]
            if (item) {
              this.editor.view.dispatch(
                this.editor.view.state.tr.insertText(
                  `: ${item.properties.name} (${item.properties.primary_role}) — ${item.properties.short_description}. Based in ${item.properties.city_name}, ${item.properties.country_code} `
                )
              )
            }
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
