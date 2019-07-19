import Header from './Header'
import Transaction from './Transaction'
import { rlp, baToJSON } from 'ethereumjs-util'


export default class Block {
    header = new Header()
    transactions = []
    transactionTrie = []

    get hash () {
        return this.header.hash
    }

    constructor(data) {
        if (!data) {
            data = [[], [], []]
        } else if (Buffer.isBuffer(data)) {
            data = rlp.decode(data)

        }

        let rawTransactions

        if (Array.isArray(data)) {
            this.header = new Header(data[0])
            rawTransactions = data[1]
        } else {
            this.header = new Header(data.header)
            rawTransactions = data.transactions || []
        }

        for (let i = 0; i < rawTransactions.length; i++) {
            var tx = new Transaction(rawTransactions[i])
            this.transactions.push(tx)
        }
    }

    get raw () {
        let raw = [
            this.header.raw,
            [],
            []
        ]
        this.transactions.forEach(function (tx) {
            raw[1].push(tx.raw)
        })

        return raw
    }

    serialize () {
        return rlp.encode(this.raw)
    }

    toJSON (labeled) {
        if (labeled) {
            var block = {
                header: this.header.toJSON(true),
                transactions: [],
            }
            this.transactions.forEach(function (tx) {
                block.transactions.push(tx.toJSON(labeled))
            })
            return block
        } else {
            return baToJSON(this.raw)
        }
    }

    initFromRpc (blockParams) {
        const block = new Block({
            transactions: [],
            uncleHeaders: []
        })

        block.header = new Header({
            number: blockParams.number,
            parentHash: blockParams.parentHash,
            coinbase: blockParams.miner,
            stateRoot: blockParams.stateRoot,
            transactionsTrie: blockParams.transactionsRoot,
            gasUsed: blockParams.gasUsed,
            gasLimit: blockParams.gasLimit,
            difficulty: blockParams.difficulty,
            timestamp: blockParams.timestamp,
            nonce: blockParams.nonce
        })

        return block
    }
}