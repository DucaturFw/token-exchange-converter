import main from './main'

describe('ETH/EOS transaction converter to universal Ducat', () => {
  test('should be get changes from eth and eos tables and insert into ducat exchanges table correctly', () => {
    const r = {
      db: jest.fn().mockImplementation(() => r),
      table: jest.fn().mockImplementation(() => r),
      insert: jest.fn().mockImplementation(() => r),
      run: jest.fn().mockImplementation(() => r),
      filter: jest.fn().mockImplementation(() => r),
      changes: jest.fn().mockImplementation(() => r),
      map: jest.fn().mockImplementation(() => r),
    } as any

    const web3 = {
      utils: {
        hexToAscii: jest.fn().mockImplementation(v => v)
      }
    } as any

    main(web3, r, r)

    expect(r.db).toHaveBeenCalledTimes(3)
    expect(r.db).toHaveBeenCalledWith('eth')
    expect(r.db).toHaveBeenCalledWith('eos')
    expect(r.db).toHaveBeenCalledWith('ducat')
    expect(r.table).toHaveBeenCalledTimes(3)

    expect(r.run).toHaveBeenCalledTimes(2)

    // ETH
    const changesCb = r.run.mock.calls[0][1]
    const eachCb = jest.fn()
    changesCb(null, { each: eachCb })

    const eachCalled = eachCb.mock.calls[0][0]
    eachCalled(null, {
      transactionHash: '0x00',
      returnValues: {
        adr: '0x01',
        from: '0x02',
        value: '10000',
        newNetwork: '2'
      }
    })

    expect(r.insert).toHaveBeenCalledTimes(1)
    expect(r.insert).toHaveBeenCalledWith({
      amount: 1e-14,
      blockchainFrom: 'eth',
      blockchainTo: 'eos',
      from: '0x02',
      to: '0x01',
      tx: '0x00'
    })

    expect(r.run).toHaveBeenCalledTimes(3)

    // EOS
    const eosChangesCb = r.run.mock.calls[1][1]
    const eosEachCb = jest.fn()
    eosChangesCb(null, { each: eosEachCb })

    const eosEachCalled = eosEachCb.mock.calls[0][0]
    eosEachCalled(null, {
      amount: '1.0000 DUCAT',
      blockchain: 'eth',
      from: 'ducone',
      to: '0x000000000',
      txid: '0x1'
    })

    expect(r.insert).toHaveBeenCalledTimes(2)
    expect(r.insert).toHaveBeenLastCalledWith({
      amount: 1,
      blockchainFrom: 'eos',
      blockchainTo: 'eth',
      from: 'ducone',
      to: '0x000000000',
      tx: '0x1'
    })

    expect(r.run).toHaveBeenCalledTimes(4)
  })
})