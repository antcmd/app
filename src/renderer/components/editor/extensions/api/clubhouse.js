import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

const api = {
  name: 'clubhouse',
  alias: 'club',
}

const getStories = (domain) =>
  fetch(`/api/clubhouse/stories`, { method: 'GET' }).then((r) => r.json())

export default class Clubhouse extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(
        new RegExp(`/${api.alias}$`),
        (state, match, start, end) => {
          const domain = match.input.slice(0, -api.alias.length - 1)

          getStories(domain).then(({ data: stories }) => {
            const todo = stories.filter(
              (s) => !s.started && s.workflow_state_id !== 500000008
            )
            const started = stories.filter((s) => s.started && !s.completed)
            const completed = stories.filter((s) => s.completed)

            this.editor.view.dispatch(
              this.editor.view.state.tr.insertText(
                `todo:\n• ${todo.map((s) => s.name).join('\n• ')}\n\n`
              )
            )
            this.editor.view.dispatch(
              this.editor.view.state.tr.insertText(
                `started:\n• ${started.map((s) => s.name).join('\n• ')}\n\n`
              )
            )
            this.editor.view.dispatch(
              this.editor.view.state.tr.insertText(
                `completed:\n• ${completed.map((s) => s.name).join('\n• ')}\n\n`
              )
            )
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
