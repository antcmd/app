// import base64url from 'base64url'
// import vuexLocal from '../plugins/vuex-persist'

// const gapi = process.browser ? window.gapi : {}

// const GMAIL_CLIENT_ID =
//   '335114584327-5mpvdtadhh8hp8lbhg1s9eg4i9e8ak34.apps.googleusercontent.com'
// const GMAIL_API_KEY = 'AIzaSyDCFU-HCEyIojyN6mWdtvzopAch58YSWc8'
// const SCOPES =
//   'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.addons.current.message.action'
// const DISCOVERY_DOCS = [
//   'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
// ]

// export const state = () => ({
//   signed: false,
//   inbox: [],
// })

// export const mutations = {
//   signIn(state) {
//     gapi.auth2.getAuthInstance().signIn()
//     state.signed = true
//   },

//   signOut(state) {
//     gapi.auth2.getAuthInstance().signOut()
//     state.signed = false
//   },

//   send(state, { email, message }) {
//     gapi.client.gmail.users.messages
//       .send({
//         userId: 'me',
//         resource: {
//           raw: base64url(
//             `From: John Doe <jdoe@machine.example>
//   To: John Doe <${email}>
//   Subject: Saying Hello
//   Date: Fri, 21 Nov 1997 09:55:06 -0600
//   Message-ID: <1234@local.machine.example>

//   ${message}`
//           ),
//         },
//       })
//       .then((r) => console.log(r))
//   },

//   watchSignin(state, isSigned) {
//     if (isSigned) {
//       // this.commit('gmail/getInbox')
//       state.signed = true
//     } else {
//       state.signed = false
//     }
//   },

//   async initClient(state, g) {
//     console.log('init')
//     await gapi.client
//       .init({
//         apiKey: GMAIL_API_KEY,
//         clientId: GMAIL_CLIENT_ID,
//         discoveryDocs: DISCOVERY_DOCS,
//         scope: SCOPES,
//       })
//       .then(
//         () => {
//           // Listen for sign-in state changes.
//           gapi.auth2
//             .getAuthInstance()
//             .isSignedIn.listen((isSigned) =>
//               this.commit('gmail/watchSignin', isSigned)
//             )
//           console.log(this)

//           // Handle the initial sign-in state.
//           this.commit(
//             'gmail/watchSignin',
//             gapi.auth2.getAuthInstance().isSignedIn.get()
//           )
//         },
//         function (error) {
//           console.log(error)
//         }
//       )
//   },

//   getMessage(state, id) {
//     if (state.inbox.length > 0) {
//       return state.inbox.find((m) => m.id === id)
//     }

//     return gapi.client.gmail.users.messages
//       .get({
//         userId: 'me',
//         id,
//       })
//       .then(({ result }) => formatMessage(result))
//   },

//   getInbox(state) {
//     gapi.client.gmail.users.messages
//       .list({
//         userId: 'me',
//         maxResults: 10,
//         labelIds: ['INBOX'],
//       })
//       .then(
//         ({ result: { messages: m = [] } = {} }) => m,
//         // eslint-disable-next-line no-console
//         (err) => console.error('Execute error', err)
//       )
//       .then((m) =>
//         m.map((message) =>
//           gapi.client.gmail.users.messages
//             .get({
//               userId: 'me',
//               id: message.id,
//             })
//             .then(({ result }) => {
//               console.log(result)
//               state.inbox = [...state.inbox, formatMessage(result)]
//             })
//         )
//       )
//   },
// }

// const formatMessage = (gmailObj) => ({
//   id: gmailObj.id,
//   subject: gmailObj.payload.headers.find((h) => h.name === 'Subject').value,
//   from: gmailObj.payload.headers.find((h) => h.name === 'From').value,
//   date: gmailObj.payload.headers.find((h) => h.name === 'Date').value,
//   body: gmailObj.snippet,
// })

// export const plugins = [vuexLocal.plugin]

// // const onClientLoad = () => {
// //   gapi.load('client:auth2', initClient)
// // }
