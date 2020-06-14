import { Howl } from 'howler'
import vuexLocal from '../plugins/vuex-persist'

export const state = () => ({
  count: 1,
  pages: [
    {
      id: 1,
      url: '/',
      title: '',
      content: '',
    },
  ],
})

export const mutations = {
  addPage(state, options) {
    console.log(options)
    const { redirect, url, title = '', content = '' } = options

    const id = state.count + 1
    const pageUrl = url || `/${id}`

    state.pages.push({
      id,
      title,
      content: title === '' ? content : `<h1>${title}</h1><p></p>`,
      url: pageUrl,
    })

    state.count += 1

    if (redirect) {
      console.log('redirect')
      this.$router.push(pageUrl)
    }
  },

  async publish(state, { id, theme }) {
    const page = state.pages.find((p) => p.id === id)

    let content = page.content

    function replaceAll(string, search, replace) {
      return string.split(search).join(replace)
    }

    // TODO: dirty hack. rework later
    content = replaceAll(content, '/pu', '')

    // const result = await fetch('/api/prisma/pages', {
    //   method: 'POST',
    //   headers: {
    //     'content-type': 'application/json'
    //     // Origin: 'https://antapi-ignatif.antcmdtm.now.sh'
    //   },
    //   body: JSON.stringify({ ...page, content, theme })
    // }).then((r) => r.json())

    const result = await fetch(
      'https://cors-anywhere.herokuapp.com/http://ec2-54-87-171-242.compute-1.amazonaws.com:3000/page',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'http://ec2-54-87-171-242.compute-1.amazonaws.com',
        },
        body: JSON.stringify({ ...page, content, theme }),
      }
    ).then((r) => r.json())
    console.log(result)

    if (result && result.id) {
      const url = `https://antglobe.now.sh/${result.id}`
      const win = window.open(url, '_blank')
      win.focus()
    }
  },

  removePage(state, id) {
    state.pages = state.pages.filter((p) => p.id !== id)
  },

  goToPage(state) {
    soundMove.play()
  },

  toNextPage(state) {
    soundMove.play()
    const currentIndex = state.pages.findIndex(
      (p) => p.url === this.$router.currentRoute.path
    )
    let pageUrl

    if (currentIndex || currentIndex === 0) {
      const nextIndex = (currentIndex + 1) % state.pages.length
      pageUrl = state.pages[nextIndex].url
    } else {
      pageUrl = state.pages[0].url
    }

    this.$router.push(pageUrl)
  },

  toPreviousPage(state) {
    soundMove.play()
    const currentIndex = state.pages.findIndex(
      (p) => p.url === this.$router.currentRoute.path
    )
    let pageUrl

    if (currentIndex || currentIndex === 0) {
      const nextIndex =
        (currentIndex + state.pages.length - 1) % state.pages.length

      pageUrl = state.pages[nextIndex].url
    } else {
      pageUrl = state.pages[0].url
    }

    this.$router.push(pageUrl)
  },

  saveContent(state, { url, value }) {
    const pageIndex = state.pages.findIndex((p) => p.url === url)
    const page = state.pages[pageIndex]

    if (!page) {
      this.commit('pages/addPage', {
        url: this.$router.currentRoute.path,
        content: value,
      })
    }

    state.pages[pageIndex] = { ...page, title: getTitle(value), content: value }
  },
}

export const getters = {
  pages: (state) => state.pages,
  pageByUrl: (state) => (url) => {
    const r = state.pages.find((p) => p.url === url)
    return r
  },
}

export const plugins = [vuexLocal.plugin]

const getTitle = (value) => {
  const h1 = value.indexOf('<h1>') + 4
  const h1Closing = value.indexOf('</h1>')
  const title = value.slice(h1, h1Closing) || ''

  return title
}

const soundMove = new Howl({
  src: '/sounds/casual/click2.wav',
  volume: 0.5,
})
