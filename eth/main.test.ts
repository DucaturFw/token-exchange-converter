import main from './main'

describe('ETH transaction converter to universal Ducat', () => {
  test('should be get changes from eth table and insert into ducat exchanges table correctly', () => {
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

    expect(r.db).toHaveBeenCalledTimes(2)
    expect(r.db).toHaveBeenCalledWith('eth')
    expect(r.db).toHaveBeenCalledWith('ducat')
    expect(r.table).toHaveBeenCalledTimes(2)
    expect(r.table).toHaveBeenCalledWith('contractCalls')
    expect(r.table).toHaveBeenCalledWith('exchanges')
    expect(r.table).toHaveBeenCalledWith('exchanges')

    expect(r.run).toHaveBeenCalledTimes(1)

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

    expect(r.run).toHaveBeenCalledTimes(2)
  })
})