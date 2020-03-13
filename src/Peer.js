/* eslint-disable no-useless-catch */
import * as wrtc from 'wrtc'
import { List } from 'immutable'
import Node from './Node'
import MessageType from './MessageType'
import Message from './Message'
import Blockchain from './Blockchain'
import Transaction from './Transaction'
import SimplePeer from 'simple-peer'
import io from 'socket.io-client'
import Debug from 'debug'

const debug = Debug('iochain:peer')

export default class Peer extends Node {

    _peers = {}
    _room = 'mainnet'
    _peerOptions = {
        config: {
            'iceServers': [
                { 'urls': 'stun:stun.stunprotocol.org:3478' },
                { 'urls': 'stun:stun.l.google.com:19302' },
            ]
        },
        wrtc: wrtc,
    }

    connect (host, port) {
        if (this._io) {
            this._io.close()
        }
        //TODO:如果切换host，通知自己以前的同伴
        this._io = io(
            `ws://${host}:${port}`,
            {
                transports: ['websocket'],
            }
        )
        this._io.on('connect', this._onConnection.bind(this))
        this._io.on('peers', this._onPeers.bind(this))
        this._io.on('signal', this._onSignal.bind(this))
        this._io.on('error', this._onError.bind(this))
        this._io.on('connect_error', this._onConnectError.bind(this))
    }

    broadcast (msg) {
        Object.keys(this._peers).forEach((id) => {
            try {
                this._peers[id].send(Buffer.from(msg, 'utf8'))
            } catch (error) {
                delete this._peers[id]
            }
        })
    }

    send (id, msg) {
        if (typeof msg === 'object') {
            msg = JSON.stringify(msg)
        }
        this._peers[id].send(Buffer.from(msg, 'utf8'))
    }

    connectedPeers () {
        Object.keys(this._peers).forEach(id => {
            console.log('%s | %s:%s\n',id, this._peers[id].localAddress, this._peers[id].localPort)
        })
    }

    // Events of websocket
    _onConnection () {
        this._io.emit('join', this._room)
    }

    _onError (error) {
        console.log(error)
    }

    _onConnectError (error) {
        console.log(error.toString())
        this._io.close()
    }

    _onPeers (peers) {
        this._mergePeersFromHub(peers)
    }

    _onSignal (data) {
        this._mergePeersFromData(data)
    }

    // Events of Peer
    _onPeerConnect (id) {
        //this.send(id, Message.ping())
    }

    _onPeerClose (id) {
        delete this._peers[id]
    }

    _onPeerSignal (id, signal) {
        this._io.emit(
            'signal',
            {
                id: id,
                signal: signal,
            }
        )
    }

    _onPeerData (id, data) {
        console.log('received data ' + data + ' from ' + id)
        try {
            const obj = JSON.parse(data.toString('utf8'))
            if (typeof obj === 'object') {
            /*
            if (obj.type == MessageType.PING) {
                debug('[Peer::_onPeerData] send pong to %s', id )
                this.send(id, JSON.stringify(Message.pong()))
            } else if (obj.type == MessageType.PONG) {
                debug('[Peer::_onPeerData] send ping to %s', id )
                this.send(id, JSON.stringify(Message.ping()))
            }
            */
            }
        }
        catch(error) {
            console.log(error)
        }

    }

    // eslint-disable-next-line no-unused-vars
    _onPeerError (id, error) {
        //console.log('Peer %s has error: $o', id, error)
        delete this._peers[id]
    }

    _mergePeersFromData (data) {
        if (!this._peers[data.id]) {
            const options = Object.assign(
                {
                    initiator: false,
                    channelName: this._room,
                },
                this._peerOptions
            )
            let peer = new SimplePeer(options)
            this._peers[data.id] = peer
            this._registerPeerEvents(data.id, peer)
        }

        try {
            this._peers[data.id].signal(data.signal)
        } catch (error) {
            delete this._peers[data.id]
        }

    }

    _mergePeersFromHub (peers) {
        const options = Object.assign(
            {
                initiator: true,
                channelName: this._room,
            },
            this._peerOptions
        )

        peers.forEach(id => {
            if (id != this._io.id) {
                let peer = new SimplePeer(options)
                this._peers[id] = peer
                this._registerPeerEvents(id, peer)
            }
        })
    }

    _registerPeerEvents (id, peer) {
        peer.on(
            'connect',
            this._onPeerConnect.bind(this, id)
        )

        peer.on(
            'signal',
            this._onPeerSignal.bind(this, id)
        )

        peer.on(
            'close',
            this._onPeerClose.bind(this, id)
        )

        peer.on(
            'data',
            this._onPeerData.bind(this, id)
        )

        peer.on(
            'error',
            this._onPeerError.bind(this, id)
        )
    }
}
