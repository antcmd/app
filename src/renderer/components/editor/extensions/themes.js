import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

function createThemeInputRule(theme, setTheme) {
  return new InputRule(new RegExp(`/${theme}`), (state, match, start, end) => {
    setTheme(theme)
    return state.tr.insertText('', end - (theme.length + 1), end)
  })
}

export default class Themes extends Extension {
  inputRules({ type }) {
    return [
      createThemeInputRule('dark', this.options.setTheme),
      createThemeInputRule('light', this.options.setTheme),
      createThemeInputRule('yellow', this.options.setTheme),
      createThemeInputRule('red', this.options.setTheme),
      createThemeInputRule('green', this.options.setTheme),
      createThemeInputRule('grey', this.options.setTheme),
      // createThemeInputRule('blue', this.options.setTheme),
      // createThemeInputRule('orange', this.options.setTheme),
      // createThemeInputRule('purple', this.options.setTheme),

      // Toggle
      new InputRule(new RegExp(`/theme`), (state, match, start, end) => {
        this.options.toggleTheme()

        return state.tr.insertText('', end - 6, end)
      }),
    ]
  }
}
