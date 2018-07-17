import r from 'rethinkdb'
import Web3 from 'web3'

import main from './main'

export const init = async () => {
  const conn = await r.connect({ host: 'localhost', port: 28015 })
  const web3 = new Web3(/* props? */)

  main(web3, r, conn)
}

init()