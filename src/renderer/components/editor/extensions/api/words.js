import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

const api = {
  name: 'synonym',
  alias: 's',
}

const fetchSynonym = (word) =>
  fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
      'x-rapidapi-key': '14b00a912dmshc29f3d5dd244910p17f6a9jsnecfe9e250ed2',
    },
  }).then((r) => r.json())

export default class Hunter extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(
        new RegExp(`w*/${api.alias}$`),
        (state, match, start, end) => {
          const word = match.input.slice(0, -api.alias.length - 1)

          fetchSynonym(word).then(({ synonyms = [] }) => {
            if (synonyms.length === 0) {
              this.editor.view.dispatch(
                this.editor.view.state.tr.insertText(`~`)
              )
            }
          })

          return state.tr
            .insertText('', end - api.alias.length, end)
            .setMeta('api-call', {
              api: api.name,
              word,
            })
        }
      ),
    ]
  }
}
