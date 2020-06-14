import { InputRule } from 'prosemirror-inputrules'
import { Extension } from 'tiptap'

const api = {
  name: 'clearbit',
  alias: 'clearbit',
}

const fetchClearbitCompany = (domain) =>
  fetch(`/api/clearbit/company/${domain}`, {
    method: 'GET',
  })
    .then((r) => r.json())
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err)
    })

const fetchClearbitPerson = (email) =>
  fetch(`/api/clearbit/person/${email}`, {
    method: 'GET',
  })
    .then((r) => r.json())
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err)
    })

export default class Clearbit extends Extension {
  inputRules({ type }) {
    return [
      new InputRule(
        new RegExp(`w*/${api.alias}$`),
        (state, match, start, end) => {
          const domain = match.input.slice(0, -api.alias.length - 1)

          if (/\S+@\S+\.\S+/.test(domain)) {
            fetchClearbitPerson(domain).then((person) => {
              this.editor.view.dispatch(
                this.editor.view.state.tr.insertText(
                  `: ${person.name.fullName}. Employment: ${person.employment.title} at ${person.employment.name}`
                )
              )
            })
          } else {
            fetchClearbitCompany(domain).then((company) => {
              this.editor.view.dispatch(
                this.editor.view.state.tr.insertText(
                  `: ${company.legalName}. (${company.category.industry}). Alexa global rank: ${company.metrics.alexaGlobalRank}, Alexa US rank: ${company.metrics.alexaUsRank}, Annual revenue: ${company.metrics.annualRevenue}, Estimated annual revenue: ${company.metrics.estimatedAnnualRevenue}. Employees: ${company.metrics.employees}, Market cap: ${company.metrics.marketCap}, Raised: ${company.metrics.raised} `
                )
              )
            })
          }

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
