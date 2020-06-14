const { CLEARBIT_TOKEN } = require('../tokens')
// eslint-disable-next-line import/order
const clearbit = require('clearbit')(CLEARBIT_TOKEN)

export default function handler(req, res) {
  const { email } = req.params

  clearbit.Person.find({ email, stream: true })
    .then((response) => {
      res.status(200).json(response)
    })
    .catch(clearbit.Person.QueuedError, function (err) {
      // Lookup is queued - try again later
      // eslint-disable-next-line no-console
      console.log(err)
      res.status(202).json({ error: 'queueing' })
    })
    .catch(clearbit.Person.NotFoundError, function (err) {
      // Person could not be found
      // eslint-disable-next-line no-console
      console.error(err)
      res.status(400).json({ error: 'not foun' })
    })
    .catch(function (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    })
}
