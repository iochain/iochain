/* eslint-disable no-useless-catch */
import Block from './Block'
import level from 'level'
import Debug from 'debug'
import { rlp } from 'ethereumjs-util'

const debug = Debug('iochain:blockchain')

export default class Blockchain {
    _db = new level(
        `./db/${process.env.DB_BLOCKCHAIN || 'blockchain'}`,
        {
            keyEncoding: 'binary',
            valueEncoding: 'binary'
        }
    )
    _index = 0
    _blockPrefix = 'block_'
    _genesisBlock = new Block()

    constructor() {
        this._genesis()
    }

    async _genesis () {
        try {
            const blockData = await this._getBlock(0)
            this._genesisBlock = new Block(blockData)
            debug('[Blockchain::_genesis]_genesisBlock: %o', this._genesisBlock.toJSON(true))
        } catch (error) {
            await this._putBlock(0, this._genesisBlock)
        }
    }

    async _putBlock (index, block) {
        let blockData = block.serialize()
        debug('[Blockchain::_genesis]_putBlock: %s, data: %o', index, blockData)
        await this._db.put(`${this._blockPrefix}_${index}`, blockData)
    }

    async _getBlock (index) {
        let blockData = await this._db.get(`${this._blockPrefix}_${index}`)
        debug('[Blockchain::_genesis]_getBlock: %s, data: %o', index, blockData)
        if (blockData) {
            return rlp.decode(blockData)
        } else {
            return {}
        }
    }
}