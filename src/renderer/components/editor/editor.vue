<template>
  <div class="page">
    <div class="editor">
      <editor-content class="editor__content" :editor="editor" />
    </div>
    <suggestions ref="suggestions" :select="selectSuggestion" />
  </div>
</template>

<script>
import { Editor, EditorContent } from 'tiptap'
import {
  BulletList,
  ListItem,
  Underline,
  HorizontalRule,
  Strike,
  History,
} from 'tiptap-extensions'
import { Howl } from 'howler'
import { mapState } from 'vuex'

import Pages from './extensions/commands/pages/pages'
import Home from './extensions/commands/pages/home'
import New from './extensions/commands/pages/new'
import Remove from './extensions/commands/pages/remove'
import Publish from './extensions/commands/publish'
import Themes from './extensions/themes'

// elements
import Doc from './extensions/elements/doc'
import Title from './extensions/elements/title'
import Heading from './extensions/elements/heading'
import Bold from './extensions/elements/bold'
import Italic from './extensions/elements/italic'
import Link from './extensions/elements/link'

import Suggestions from './suggestions'
import Mention from './extensions/plugins/mention'
import RegexMention from './extensions/plugins/regexMention'

// api
import Hunter from './extensions/api/hunter'
import Crunchbase from './extensions/api/crunchbase'
import Clearbit from './extensions/api/clearbit'
import Clubhouse from './extensions/api/clubhouse'

// gmail
import Inbox from './extensions/api/gmail/inbox'
import Send from './extensions/api/gmail/send'

const sound = new Howl({
  src: '/sounds/casual/switch.wav',
  volume: 0.5,
})

const soundNewPage = new Howl({
  src: '/sounds/casual/click4.wav',
  volume: 0.5,
})

export default {
  components: { EditorContent, Suggestions },

  props: {
    value: {
      type: String,
      default: '',
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      editor: null,
      editorChange: false,
      synonyms: [],
    }
  },

  computed: {
    ...mapState({
      theme: function (state) {
        return state.app.theme
      },
      suggestionItems: function (state) {
        return state.suggestions.items
      },
      suggestionQuery: function (state) {
        return state.suggestions.suggestionQuery
      },
      pages: function (state) {
        return state.pages.pages
      },
    }),
  },

  watch: {
    value(val) {
      if (this.editor && !this.editorChange) {
        this.editor.setContent(val, true)
      }
      this.editorChange = false
    },
    theme(theme) {
      const htmlElement = document.documentElement

      if (theme) {
        localStorage.setItem('theme', theme)
        htmlElement.setAttribute('theme', theme)
      }
    },
  },

  mounted() {
    this.editor = new Editor({
      content: this.value,
      editable: true,
      extensions: [
        new Home(),
        new New(),
        new Remove(),
        new Pages(),
        new Publish(),

        new Themes({
          theme: this.theme,
          setTheme: this.setTheme,
          toggleTheme: this.toggleTheme,
        }),

        new Hunter(),
        new Crunchbase(),
        new Clearbit(),
        new Clubhouse(),

        new Doc(),
        new Title(),
        new Heading({ levels: [1, 2, 3] }),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline(),
        new BulletList(),
        new ListItem(),
        new HorizontalRule(),
        new Link(),

        new History(),

        new Inbox(),
        new Send(),

        // Domain and Email suggestions on @
        new Mention({
          onEnter: this.$refs.suggestions.onSuggestionStart,
          onChange: this.$refs.suggestions.onChange,
          onExit: this.$refs.suggestions.onExit,
          onKeyDown: this.$refs.suggestions.onKeyDown,

          items: () => {
            this.getDomainsAndEmails()
            return this.suggestionItems
          },
        }),

        // Link or new page
        new Mention({
          matcher: { char: '>', allowSpaces: true },
          onEnter: ({ items, query, range, command, virtualNode }) =>
            this.$refs.suggestions.onSuggestionStart({
              items: this.pages.map((p) => ({
                name: p.title,
                id: p.url,
                url: p.url,
                type: 'page-link',
              })),
              query,
              range,
              command,
              virtualNode,
              type: 'page-link',
            }),
          onChange: this.$refs.suggestions.onChange,
          onExit: this.$refs.suggestions.onExit,
          onKeyDown: this.$refs.suggestions.onKeyDown,

          /* items: () => { */
          /*   return */
          /* } */
        }),

        // Synonyms
        new RegexMention({
          matcher: /(\w*)\/s\b/,
          onEnter: async ({ items, query, range, command, virtualNode }) => {
            const synonyms = await this.getSynonyms(query)
            this.$refs.suggestions.onSuggestionStart({
              items: synonyms.map((i, index) => ({
                id: index,
                name: i,
                type: 'synonym',
              })),
              query,
              range,
              command,
              virtualNode,
              label: 'Similar',
            })
          },
          onChange: this.$refs.suggestions.onChange,
          onExit: this.$refs.suggestions.onExit,
          onKeyDown: this.$refs.suggestions.onKeyDown,
        }),

        // Rhymes
        new RegexMention({
          matcher: /(\w*)\/rhy\b/,
          onEnter: async ({ items, query, range, command, virtualNode }) => {
            const rhymes = await this.getRhymes(query)
            this.$refs.suggestions.onSuggestionStart({
              items: rhymes.map((i, index) => ({
                id: index,
                name: i,
                type: 'rhyme',
              })),
              query,
              range,
              command,
              virtualNode,
              label: 'Rhymes',
            })
          },
          onChange: this.$refs.suggestions.onChange,
          onExit: this.$refs.suggestions.onExit,
          onKeyDown: this.$refs.suggestions.onKeyDown,
        }),

        // Recipe
        new RegexMention({
          matcher: /(\w*)\/recipe\b/,
          onEnter: async ({ items, query, range, command, virtualNode }) => {
            const recipes = await this.getRecipes(query)
            this.$refs.suggestions.onSuggestionStart({
              items: recipes.map((i, index) => ({
                id: index,
                name: i.title,
                recipeId: i.id,
                type: 'recipe',
              })),
              query,
              range,
              command,
              virtualNode,
            })
          },
          onChange: this.$refs.suggestions.onChange,
          onExit: this.$refs.suggestions.onExit,
          onKeyDown: this.$refs.suggestions.onKeyDown,
        }),
      ],

      onUpdate: ({ transaction, getHTML }) => {
        if (transaction.getMeta('home')) {
          sound.play()
          this.$router.push('/')
        }

        if (transaction.getMeta('new-page')) {
          soundNewPage.play()
          this.newPage({ redirect: true })
        }

        if (transaction.getMeta('remove')) {
          soundNewPage.play()
          this.removePage()
          this.newPage({ redirect: true })
        }

        if (transaction.getMeta('pages')) {
          sound.play()
          this.$router.push('/pages')
        }

        if (transaction.getMeta('publish')) {
          sound.play()
          this.publishPage()
        }

        if (transaction.getMeta('inbox')) {
          sound.play()

          this.$store.commit('gmail/getInbox')
        }

        if (transaction.getMeta('send')) {
          sound.play()
          /* this.sendMessage() */
        }

        if (transaction.getMeta('api-call')) {
          sound.play()
        }

        this.editorChange = true
        this.$emit('input', getHTML())
      },
      autoFocus: true,
    })

    if (this.value !== '') {
      this.editor.focus('end')
    }
  },

  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy()
    }
  },

  methods: {
    publishPage() {
      this.$store.commit('pages/publish', {
        id: this.$attrs.page.id,
        theme: this.theme,
      })
    },

    async getSynonyms(word) {
      const res = await fetch(
        `https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
            'x-rapidapi-key':
              '14b00a912dmshc29f3d5dd244910p17f6a9jsnecfe9e250ed2',
          },
        }
      ).then((r) => r.json())
      return res.synonyms
    },

    async getRhymes(word) {
      const res = await fetch(
        `https://wordsapiv1.p.rapidapi.com/words/${word}/rhymes`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
            'x-rapidapi-key':
              '14b00a912dmshc29f3d5dd244910p17f6a9jsnecfe9e250ed2',
          },
        }
      ).then((r) => r.json())
      return res.rhymes.all
    },

    async getRecipes(word) {
      const res = await fetch(
        `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?offset=0&type=main%20course&query=${word}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host':
              'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            'x-rapidapi-key':
              '14b00a912dmshc29f3d5dd244910p17f6a9jsnecfe9e250ed2',
          },
        }
      )
        .then((r) => r.json())
        .catch((err) => {
          console.log(err)
        })
      console.log(res)
      return res.results
    },

    async getRecipe(recipeId) {
      const res = await fetch(
        `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeId}/information`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host':
              'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            'x-rapidapi-key':
              '14b00a912dmshc29f3d5dd244910p17f6a9jsnecfe9e250ed2',
          },
        }
      )
        .then((r) => r.json())
        .catch((err) => {
          console.log(err)
        })

      const { view, selection } = this.editor

      view.dispatch(
        view.state.tr.insertText(
          `Ingredients: ${res.extendedIngredients.map(
            (i) => i.name
          )}. \n\nInstructuions: ${res.instructions}`,
          selection.from - (7 + this.suggestionQuery.length),
          selection.from
        )
      )
      return res
    },

    setTheme(theme) {
      this.$store.commit('app/setTheme', theme)
    },

    toggleTheme(theme) {
      const htmlElement = document.documentElement

      const themes = ['light', 'dark', 'red', 'yellow', 'grey']
      const currentThemeIndex = themes.indexOf(this.theme)
      const nextThemeIndex = currentThemeIndex === 4 ? 0 : currentThemeIndex + 1
      const nextTheme = themes[nextThemeIndex]

      htmlElement.setAttribute('theme', nextTheme)
      this.setTheme(nextTheme)
    },

    getDomainsAndEmails() {
      this.$store.commit(
        'suggestions/getDomainsAndEmails',
        this.editor.getHTML()
      )
    },

    selectSuggestion(suggestion) {
      switch (suggestion.type) {
        case 'mention': {
          const { view, selection } = this.editor

          view.dispatch(
            view.state.tr.insertText(
              `${suggestion.name}`,
              selection.from - (1 + this.suggestionQuery.length),
              selection.from
            )
          )
          this.$router.push(suggestion.url)
          break
        }

        case 'synonym': {
          const { view, selection } = this.editor

          view.dispatch(
            view.state.tr.insertText(
              `${suggestion.name}`,
              selection.from - (2 + this.suggestionQuery.length),
              selection.from
            )
          )
          break
        }

        case 'rhyme': {
          const { view, selection } = this.editor

          view.dispatch(
            view.state.tr.insertText(
              `${suggestion.name}`,
              selection.from - (4 + this.suggestionQuery.length),
              selection.from
            )
          )
          break
        }

        case 'recipe': {
          this.getRecipe(suggestion.recipeId)
          break
        }

        case 'page-link': {
          const { view, selection } = this.editor

          view.dispatch(
            view.state.tr
              .insertText(
                `${suggestion.name} `,
                selection.from - (1 + this.suggestionQuery.length),
                selection.from
              )
              .addMark(
                selection.from - 1,
                selection.from + suggestion.name.length,
                this.editor.schema.marks.link.create({
                  href: suggestion.url.slice(1),
                })
              )
          )
          break
        }

        case 'new-page': {
          const { view } = this.editor
          const { range } = suggestion

          const pageTitle = this.suggestionQuery

          this.newPage({ redirect: false, title: pageTitle })
          view.dispatch(
            view.state.tr
              .insertText(`${this.suggestionQuery} `, range.from - 1, range.to)
              .addMark(
                range.from,
                range.to,
                this.editor.schema.marks.link.create({
                  href: this.suggestionQuery,
                })
              )
          )
          break
        }

        default:
          break
      }

      this.$refs.suggestions.destroyPopup()
    },

    removePage() {
      this.$store.commit('pages/removePage', this.$attrs.page.id)
    },

    newPage(options = { redirect: false, title: '' }) {
      console.log('new page')
      const { redirect = true, title = '' } = options
      this.$store.commit('pages/addPage', { redirect, title })
    },

    goToPage() {
      const user = this.filteredUsers[this.navigatedUserIndex]

      if (user) {
        const { view, selection } = this.editor
        view.dispatch(
          view.state.tr.insertText(``, selection.from - 3, selection.from)
        )

        this.$router.push({ path: `/${user.name}` })
        this.destroyPopup()
      }
    },
  },
}
</script>
