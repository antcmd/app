import vuexLocal from '../plugins/vuex-persist'

export const state = () => ({
  theme: 'light', // dark, yellow, grey, red
  sound: 'default',
  fontSize: 19,
})

export const mutations = {
  setTheme(state, theme) {
    console.log(theme)
    const htmlElement = document.documentElement
    htmlElement.setAttribute('theme', theme)

    state.theme = theme
  },
}

export const plugins = [vuexLocal.plugin]
