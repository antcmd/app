import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

export default class Bullets extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(new RegExp(`--$`), (state, match, start, end) => {
        return state.tr.insertText('•  ', end - 1, end)
      }),
    ]
  }
}
