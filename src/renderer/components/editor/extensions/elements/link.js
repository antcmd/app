// https://github.com/scrumpy/tiptap/blob/master/packages/tiptap-extensions/src/marks/Link.js
import { Mark, Plugin } from 'tiptap'
import {
  updateMark,
  removeMark,
  pasteRule,
  // wrappingInputRule
  // markInputRule
} from 'tiptap-commands'
// import { InputRule } from 'prosemirror-inputrules'
import { getMarkAttrs } from 'tiptap-utils'

export default class Link extends Mark {
  get name() {
    return 'link'
  }

  get defaultOptions() {
    return {
      openOnClick: true,
    }
  }

  get schema() {
    return {
      attrs: {
        href: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (dom) => ({
            href: dom.getAttribute('href'),
          }),
        },
      ],
      toDOM: (node) => [
        'a',
        {
          ...node.attrs,
          // rel: 'noopener noreferrer nofollow'
        },
        0,
      ],
    }
  }

  commands({ type }) {
    return (attrs) => {
      if (attrs.href) {
        return updateMark(type, attrs)
      }

      return removeMark(type)
    }
  }

  pasteRules({ type }) {
    return [
      pasteRule(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-zA-Z]{2,}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
        type,
        (url) => ({ href: url })
      ),
    ]
  }

  // markInputRule(/>([^\s]{1,})[\n\r\s]/, type, (match) => {
  inputRules({ type }) {
    /* eslint-disable */
    return [
      // markInputRule(/>([^\s]{1,})[\n\r\s]/, type, (match) => {
      //   return { href: match[1] }
      // })
      // new InputRule(new RegExp(`>hello`), (state, match, start, end) => {
      //   console.log(this)
      //   console.log(type)
      //   console.log(
      //     this.editor.schema.marks.link.create({ href: 'https://google.com' })
      //   )
      //   return null
      //   // updateMark(type, { href: 'https//google.com' })
      //   // console.log(match)
      //   return state.tr.addStoredMark(
      //     this.editor.schema.marks.link.create({ href: 'https://google.com' })
      //   )
      // })
    ]
  }

  get plugins() {
    if (!this.options.openOnClick) {
      return []
    }

    return [
      new Plugin({
        props: {
          handleClick: (view, pos, event) => {
            const { schema } = view.state
            const attrs = getMarkAttrs(view.state, schema.marks.link)

            if (attrs.href && event.target instanceof HTMLAnchorElement) {
              event.stopPropagation()
              // console.log(this)
              console.log(
                `Redirection to: ${window.location.origin}/${attrs.href}`
              )
              window.location.href = `${window.location.origin}/${attrs.href}`
              // window.location.pathname = attrs.href
              // window.open(attrs.href)
            }
          }
        }
      })
    ]
  }
}
