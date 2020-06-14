import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

export default class Publish extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(new RegExp(`/pub`), (state, match, start, end) => {
        return state.tr.insertText('', end - 4, end).setMeta('publish', true)
      }),
    ]
  }
}
