import Web3 from 'web3'
import rethinkdb, { Connection, Table, WriteResult, Cursor } from 'rethinkdb'

interface IEthereumExchangeTransfer {
  transactionHash: string,
  returnValues: {
    adr: string,
    from: string,
    value: string,
    newNetwork: string
  }
}

interface IEOSTransfer {
  amount: string
  blockchain: string
  from: string
  to: string
  txid: string
}

interface ICrossExchangeTransfer {
  from: string
  to: string
  amount: number
  tx: string
  txout: string
  blockchainFrom: string
  blockchainTo: string
}

const bcIdxToName = (idx: number | string): string => {
  const map = {
    0: "eth",
    1: "neo",
    2: "eos",
    3: "qtum",
    4: "bts"
  } as { [key: string]: string }
  return map[idx]
}

const eventEthConverter = (web3: Web3) => (event: IEthereumExchangeTransfer): ICrossExchangeTransfer => ({
  amount: parseFloat(event.returnValues.value) / 1e18,
  blockchainFrom: 'eth',
  blockchainTo: bcIdxToName(event.returnValues.newNetwork),
  from: event.returnValues.from,
  to: web3.utils.hexToAscii(event.returnValues.adr.replace(/(00)*$/gi, '')),
  tx: event.transactionHash
} as ICrossExchangeTransfer)

const convertEosEvent = (event: IEOSTransfer): ICrossExchangeTransfer => ({
  amount: parseFloat(event.amount.split(' ')[0]),
  blockchainFrom: 'eos',
  blockchainTo: event.blockchain,
  from: event.from,
  to: event.to,
  tx: event.txid
} as ICrossExchangeTransfer)

const callbackCursorItems = (cb: Function) =>
  (err: Error, cursor: Cursor) =>
    err ? console.log(err) : cursor.each(((err, row) =>
      err ? console.log(err) : cb(row)))

const onEthExchangeEvent = (conn: Connection, ethTable: Table) =>
  (cb: (result: IEthereumExchangeTransfer) => void): void =>
    ethTable
      .filter({ event: 'BlockchainExchange' })
      .changes()
      .map(v => v('new_val'))
      .run(conn, callbackCursorItems(cb))

const onEosExchangeEvent = (conn: Connection, eosTable: Table) =>
  (cb: (result: IEOSTransfer) => void): void =>
    eosTable
      .changes()
      .map(v => v('new_val'))
      .run(conn, callbackCursorItems(cb))

const insertDucatTransaction = (conn: Connection, ducatTable: Table) =>
  (data: ICrossExchangeTransfer): Promise<WriteResult> =>
    ducatTable
      .insert(data)
      .run(conn)

export default (web3: Web3, r: typeof rethinkdb, conn: Connection) => {
  const ethTable = r.db('eth').table('contractCalls')
  const eosTable = r.db('eos').table('contractCalls')
  const ducatTable = r.db('ducat').table('exchanges')
  const onEthExchange = onEthExchangeEvent(conn, ethTable)
  const onEosExchange = onEosExchangeEvent(conn, eosTable)
  const pushToDucat = insertDucatTransaction(conn, ducatTable)
  const convertEthEvent = eventEthConverter(web3)

  onEthExchange(event => pushToDucat(convertEthEvent(event)))
  onEosExchange(event => pushToDucat(convertEosEvent(event)))
}