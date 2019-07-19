import Vorpal from 'vorpal'
import Peer from './Peer'
import Hub from './Hub'
import CFonts from 'cfonts'

const vorpal = Vorpal()

const peer = new Peer()
const hub = new Hub()

const welcome = vorpal => {
    CFonts.say('iochain')
    console.log('Welcome to iochain!')
    vorpal.exec('help')
}

const connect = vorpal => {
    vorpal
        .command(
            'connect <host> <port>',
            'Connect to a new peer with <host> and <port>.'
        )
        .alias('c')
        .action((args, callback) => {
            try {
                peer.connect(args.host, args.port)
            } catch (error) {
                console.log(error)
            } finally {
                callback()
            }
        })
}

const discover = vorpal => {
    vorpal
        .command('discover', 'Discover new peers from your connected peers.')
        .alias('d')
        .action((args, callback) => {
            try {
                peer.discoverPeers()
            } catch (error) {
                console.log(error)
            } finally {
                callback()
            }
        })
}

const peers = vorpal => {
    vorpal
        .command('peers', 'Get the list of connected peers.')
        .alias('p')
        .action((args, callback) => {
            peer.connectedPeers()
            callback()
        })
}

const open = vorpal => {
    vorpal
        .command('open <port>', 'Open port <port> to accept incoming connections.')
        .alias('o')
        .action(async (args, callback) => {
            try {
                await hub.open(args.port)
                peer.connect('localhost', args.port)
            } catch (error) {
                console.log(error)
            } finally {
                callback()
            }
        })
}

const send = vorpal => {
    vorpal
        .command('send <msg>', 'Send message <msg> to accept incoming connections.')
        .action((args, callback) => {
            try {
                peer.broadcast(args.msg)
            } catch (error) {
                console.log(error)
            } finally {
                callback()
            }
        })
}

vorpal
    .use(connect)
    .use(discover)
    .use(peers)
    .use(open)
    .use(send)
    .use(welcome)
    .delimiter('iochain >')
    .show()
