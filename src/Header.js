import * as utils from 'ethereumjs-util'

export default class Header {
    constructor(data) {
        let fields = [{
            name: 'number',
            default: utils.toBuffer(0)
        }, {
            name: 'parentHash',
            length: 32,
            default: utils.zeros(32)
        }, {
            name: 'coinbase',
            length: 20,
            default: utils.zeros(20)
        }, {
            name: 'stateRoot',
            length: 32,
            default: utils.zeros(32)
        }, {
            name: 'transactionsTrie',
            length: 32,
            default: utils.KECCAK256_RLP
        }, {
            name: 'gasUsed',
            empty: true,
            default: Buffer.from([])
        }, {
            name: 'gasLimit',
            default: Buffer.from('ffffffffffffff', 'hex')
        }, {
            name: 'difficulty',
            default: Buffer.from([])
        }, {
            name: 'timestamp',
            default: Buffer.from([])
        }, {
            name: 'nonce',
            default: utils.zeros(8)
        }]
        utils.defineProperties(this, fields, data)
    }

    get hash () {
        return utils.rlphash(this.raw)
    }
}