<template>
  <client-only>
    <editor :page="page" :value.sync="page.content" @input="save" />
  </client-only>
</template>

<script>
import { mapState } from 'vuex'
import Editor from '../components/editor/editor'

export default {
  components: {
    Editor,
  },

  computed: {
    ...mapState({
      pages: function (state) {
        return state.pages
      },
      page() {
        const page = this.$store.getters['pages/pageByUrl'](
          this.$router.currentRoute.path
        )

        if (page) {
          return page
        }

        return {
          content: '',
        }
      },
    }),
  },

  beforeDestroy: function (a, b, c) {
    const page = this.$store.getters['pages/pageByUrl'](
      this.$router.currentRoute.path
    )

    if (page) {
      if (
        (page.content === '' ||
          page.content === '<h1></h1><p></p>' ||
          page.title === '') &&
        page.id
      ) {
        this.removePage(page.id)
      }
    }
  },

  beforeRouteLeave(to, from, next) {
    document.removeEventListener('keydown', this.onKeyDown)
    next()
  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.setOnEscapeListener()
    })
  },

  methods: {
    addPage() {
      this.$store.commit('pages/addPage')
    },

    toNextPage() {
      this.$store.commit('pages/toNextPage')
    },

    toPreviousPage() {
      this.$store.commit('pages/toPreviousPage')
    },

    save(value) {
      this.$store.commit('pages/saveContent', {
        id: this.page.id,
        url: this.page.url,
        value,
      })
    },

    removePage(id) {
      this.$store.commit('pages/removePage', id)
    },

    // On escape
    onKeyDown(e) {
      if (this.$router.currentRoute.path !== '/pages') {
        const { key, metaKey } = e

        if (key === 'Escape') {
          this.$router.push('/pages')
        }

        if (metaKey && key === 'o') {
          e.preventDefault()
          this.$router.push('/pages')
        }

        if (metaKey && key === 'ArrowDown') {
          this.toNextPage()
        }

        if (metaKey && key === 'ArrowUp') {
          this.toPreviousPage()
        }

        if (metaKey && key === 'p') {
          e.preventDefault()
          this.$store.commit('pages/addPage', { redirect: true })
        }
      }
    },

    setOnEscapeListener() {
      if (document) {
        document.addEventListener('keydown', this.onKeyDown)
      }
    },
  },

  head() {
    return {
      title: this.page.title !== '' ? this.page.title : 'antcmd.',
      script: [
        {
          hid: 'gapi',
          src: 'https://apis.google.com/js/api.js',
          async: true,
          defer: true,
          callback: (a) => {
            /* window.gapi.load('client:auth2', () => */
            /*   this.$store.commit('gmail/initClient') */
            /* ) */
            /* this.isStripeLoaded = true */
          },
        },
      ],
    }
  },
}
</script>
