import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

export default class New extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(new RegExp(`/n`), (state, match, start, end) => {
        return state.tr.insertText('', end - 2, end).setMeta('new-page', true)
      }),
    ]
  }
}
