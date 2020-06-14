<template>
  <client-only>
    <div class="navigation">
      <input
        ref="searchInput"
        :value="searchQuery"
        name="search"
        type="text"
        class="search"
        placeholder="Search"
        autofocus="true"
        autocomplete="off"
        @input="onChange"
      />
      <div class="body">
        <nuxt-link
          v-for="page in pages"
          :key="page.url"
          :to="page.url"
          class="page-link"
        >
          {{ page.title }}
        </nuxt-link>
      </div>
    </div>
  </client-only>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      searchQuery: '',
    }
  },

  computed: {
    ...mapState({
      pages: function (state) {
        return state.pages.pages.filter((i) =>
          i.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      },
      theme: function (state) {
        return state.app.theme
      },
    }),
  },

  watch: {
    theme(theme) {
      const htmlElement = document.documentElement

      if (theme) {
        localStorage.setItem('theme', theme)
        htmlElement.setAttribute('theme', theme)
      }
    },
  },

  beforeDestroy: function () {
    document.removeEventListener('keydown', this.onKeyDown)
  },

  mounted() {
    /* this.$refs.input.focus() */
    document.addEventListener('keydown', this.onKeyDown)
  },

  updated() {
    if (this.$refs.searchInput) {
      this.$refs.searchInput.focus()
    }
  },

  methods: {
    onKeyDown(e) {
      // TODO: on Enter move to page
      const { key, metaKey } = e

      if (key === 'Enter') {
        const page = this.pages[0]

        if (page) {
          this.$router.push(page.url)
        }
        /* this.$router.back() */
      }

      if (key === 'Escape') {
        this.$router.back()
      }

      if (metaKey && key === 'o') {
        e.preventDefault()
        this.$router.back()
      }

      if (metaKey && key === 'p') {
        e.preventDefault()
        this.$store.commit('pages/addPage', { redirect: true })
      }
    },

    onChange({ target }) {
      this.searchQuery = target.value
    },
  },

  head() {
    return {
      title: 'Pages',
    }
  },
}
</script>
