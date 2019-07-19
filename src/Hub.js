import Koa from 'koa'
import http from 'http'
import SocketIO from 'socket.io'
import Debug from 'debug'

const debug = Debug('iochain:hub')

export default class Hub {

    constructor() {
        this._app = new Koa()
        this._http = http.createServer(this._app.callback())
        this._io = SocketIO(this._http, {
            serveClient: false,
            wsEngine: 'ws'
        })
        this._app.use(async ctx => {
            ctx.body = JSON.stringify({
                peers: '/peers'
            })
        })

        this._onConnection = this._onConnection.bind(this)
        this._bindEvent = this._bindEvent.bind(this)
    }

    open (port) {
        if (this._http.listening) {
            console.info('Hub Server is already running...')
            return false
        } else {
            try {
                this._io.on('connection', this._onConnection)
                this._io.use(this._bindEvent)

            } catch (e) {
                console.error(e)
            }

            this._http.listen(port, () => {
                console.info('Listening on *:%s', port)
            })
        }
    }

    close () {
        this._http.close()
    }

    _onConnection (socket) {
        debug(socket)
    }

    _bindEvent (socket, next) {
        let self = this

        socket.on('error', error => {
            debug(error)
        })

        socket.on('disconnect', reason => {
            debug(reason)
        })

        socket.on('disconnecting', reason => {
            debug(reason)

            Object.keys(socket.rooms).forEach(room => {
                socket.leave(room)
            })
        })

        socket.on('join', room => {
            socket.join(room)
            let peers = self._io.nsps['/'].adapter.rooms[room] ? Object.keys(self._io.nsps['/'].adapter.rooms[room].sockets) : []
            socket.emit('peers', peers)
        })

        socket.on('signal', data => {
            let client = self._io.sockets.connected[data.id]
            client && client.emit('signal', {
                id: socket.id,
                signal: data.signal,
            })
        })

        return next()
    }
}