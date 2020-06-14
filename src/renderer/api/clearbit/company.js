const { CLEARBIT_TOKEN } = require('../tokens')
// eslint-disable-next-line import/order
const clearbit = require('clearbit')(CLEARBIT_TOKEN)

export default function handler(req, res) {
  const { domain } = req.params

  clearbit.Company.find({ domain })
    .then((response) => {
      res.status(200).json(response)
    })
    .catch(function (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    })
}
