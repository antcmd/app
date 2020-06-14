import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

export default class Home extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(new RegExp(`/home`), (state, match, start, end) => {
        return state.tr.insertText('', end - 5, end).setMeta('home', true)
      }),
    ]
  }
}
