import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

const api = {
  name: 'gmail',
  alias: 'inbox',
}

export default class Inbox extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(
        new RegExp(`w*/${api.alias}$`),
        (state, match, start, end) => {
          return state.tr
            .insertText('', end - api.alias.length, end)
            .setMeta('inbox', true)
        }
      ),
    ]
  }
}
