import MessageType from './MessageType'

export default class Message {
    static ping () {
        return {
            type: MessageType.PING
        }
    }

    static pong () {
        return {
            type: MessageType.PONG
        }
    }

    static requestLatestBlock () {
        return {
            type: MessageType.REQUEST_LATEST_BLOCK
        }
    }

    static receiveLatestBlock() {
        return {
            type: MessageType.RECEIVE_LATEST_BLOCK
        }
    }
}