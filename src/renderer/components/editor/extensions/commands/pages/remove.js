import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

export default class Delete extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(new RegExp(`/rm`), (state, match, start, end) => {
        return state.tr.insertText('', end - 3, end).setMeta('remove', true)
      }),
    ]
  }
}
