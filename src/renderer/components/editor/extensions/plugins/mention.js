import { Mark } from 'tiptap'
import { replaceText } from 'tiptap-commands'
import SuggestionsPlugin from './suggestions'

export default class Mention extends Mark {
  get name() {
    return 'mention'
  }

  get defaultOptions() {
    return {
      matcher: {
        char: '@',
        allowSpaces: false,
        startOfLine: false,
      },
      mentionClass: 'mention',
      suggestionClass: 'mention-suggestion',
    }
  }

  get schema() {
    return {
      attrs: {
        id: {},
        label: {},
      },
      toDOM: (node) => ['span', {}, `${node.attrs.label}`],
      parseDOM: [
        {
          tag: 'span[data-mention-id]',
          getAttrs: (dom) => {
            const id = dom.getAttribute('data-mention-id')
            const label = dom.textContent
              .split(this.options.matcher.char)
              .join('')
            return { id, label }
          },
        },
      ],
    }
  }

  commands({ schema }) {
    return (attrs) => replaceText(null, schema.marks[this.name], attrs)
  }

  get plugins() {
    return [
      SuggestionsPlugin({
        command: ({ range, attrs, schema }) =>
          replaceText(range, schema.marks[this.name], attrs),
        appendText: ' ',
        matcher: this.options.matcher,
        items: this.options.items,
        onEnter: this.options.onEnter,
        onChange: this.options.onChange,
        onExit: this.options.onExit,
        onKeyDown: this.options.onKeyDown,
        onFilter: this.options.onFilter,
        suggestionClass: this.options.suggestionClass,
      }),
    ]
  }
}
