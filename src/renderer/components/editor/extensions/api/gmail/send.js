import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

const api = {
  name: 'send',
  alias: 'e',
}

export default class Send extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(
        new RegExp(`w*/${api.alias}$`),
        (state, match, start, end) => {
          return state.tr
            .insertText('', end - api.alias.length, end)
            .setMeta('send', true)
        }
      ),
    ]
  }
}
