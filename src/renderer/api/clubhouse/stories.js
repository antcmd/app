const Clubhouse = require('clubhouse-lib')
const { CLUBHOUSE_TOKEN } = require('../tokens')

export default function handler(req, res) {
  const client = Clubhouse.create(CLUBHOUSE_TOKEN)

  client
    .searchStories('type:chore')
    .then((r) => res.status(200).json(r))
    // eslint-disable-next-line no-console
    .catch((x) => console.error(x.body))
}
