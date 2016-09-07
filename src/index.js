'use strict'

const Swarm = require('libp2p-swarm')
const TCP = require('libp2p-tcp')
// const UTP = require('libp2p-utp')
const WS = require('libp2p-websockets')
const spdy = require('libp2p-spdy')
const secio = require('libp2p-secio')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const PeerBook = require('peer-book')
const multiaddr = require('multiaddr')
const mafmt = require('mafmt')
const EE = require('events').EventEmitter

exports = module.exports

const OFFLINE_ERROR_MESSAGE = 'The libp2p node is not started yet'
const IPFS_CODE = 421

exports.Node = function Node (pInfo, pBook) {
  if (!(this instanceof Node)) {
    return new Node(pInfo, pBook)
  }

  if (!pInfo) {
    pInfo = new PeerInfo()
    pInfo.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
  }

  if (!pBook) {
    pBook = new PeerBook()
  }

  this.peerInfo = pInfo
  this.peerBook = pBook

  // Swarm
  this.swarm = new Swarm(pInfo)
  this.swarm.connection.addStreamMuxer(spdy)
  this.swarm.connection.reuse()

  this.swarm.connection.crypto(secio.tag, secio.encrypt)

  this.swarm.on('peer-mux-established', (peerInfo) => {
    this.peerBook.put(peerInfo)
  })

  this.swarm.on('peer-mux-closed', (peerInfo) => {
    this.peerBook.removeByB58String(peerInfo.id.toB58String())
  })

  let isOnline = false

  this.start = (callback) => {
    const ws = new WS()
    const tcp = new TCP()

    // Do not activate the dialer if no listener is going to be present
    if (ws.filter(this.peerInfo.multiaddrs).length > 0) {
      this.swarm.transport.add('ws', new WS())
    }
    if (tcp.filter(this.peerInfo.multiaddrs).length > 0) {
      this.swarm.transport.add('tcp', new TCP())
    }

    this.swarm.listen((err) => {
      if (err) {
        return callback(err)
      }

      isOnline = true
      callback()
    })
  }

  this.stop = (callback) => {
    isOnline = false
    this.swarm.close(callback)
  }

  this.dialById = (id, protocol, callback) => {
    if (typeof protocol === 'function') {
      callback = protocol
      protocol = undefined
    }

    if (!isOnline) {
      return callback(new Error(OFFLINE_ERROR_MESSAGE))
    }
    // NOTE, these dialById only works if a previous dial
    // was made until we have PeerRouting
    // TODO support PeerRouting when it is Ready
    callback(new Error('not implemented yet'))
  }

  this.dialByMultiaddr = (maddr, protocol, callback) => {
    if (typeof protocol === 'function') {
      callback = protocol
      protocol = undefined
    }

    if (!isOnline) {
      return callback(new Error(OFFLINE_ERROR_MESSAGE))
    }

    if (typeof maddr === 'string') {
      maddr = multiaddr(maddr)
    }

    if (!mafmt.IPFS.matches(maddr.toString())) {
      return callback(new Error('multiaddr not valid'))
    }

    const ipfsIdB58String = maddr.stringTuples().filter((tuple) => {
      if (tuple[0] === IPFS_CODE) {
        return true
      }
    })[0][1]

    let peer
    try {
      peer = this.peerBook.getByB58String(ipfsIdB58String)
    } catch (err) {
      peer = new PeerInfo(PeerId.createFromB58String(ipfsIdB58String))
    }

    peer.multiaddr.add(maddr)
    this.dialByPeerInfo(peer, protocol, callback)
  }

  this.dialByPeerInfo = (peer, protocol, callback) => {
    if (typeof protocol === 'function') {
      callback = protocol
      protocol = undefined
    }
    if (!isOnline) {
      return callback(new Error(OFFLINE_ERROR_MESSAGE))
    }

    this.swarm.dial(peer, protocol, (err, conn) => {
      if (err) {
        return callback(err)
      }
      this.peerBook.put(peer)
      callback(null, conn)
    })
  }

  this.hangUpById = (id, callback) => {
    callback(new Error('not implemented yet'))
    // TODO
  }

  this.hangUpByMultiaddr = (maddr, callback) => {
    if (!isOnline) {
      return callback(new Error(OFFLINE_ERROR_MESSAGE))
    }

    if (typeof maddr === 'string') {
      maddr = multiaddr(maddr)
    }

    if (!mafmt.IPFS.matches(maddr.toString())) {
      return callback(new Error('multiaddr not valid'))
    }

    const ipfsIdB58String = maddr.stringTuples().filter((tuple) => {
      if (tuple[0] === IPFS_CODE) {
        return true
      }
    })[0][1]

    try {
      const pi = this.peerBook.getByB58String(ipfsIdB58String)
      this.hangUpByPeerInfo(pi, callback)
    } catch (err) {
      // already disconnected
      callback()
    }
  }

  this.hangUpByPeerInfo = (peer, callback) => {
    if (!isOnline) {
      return callback(new Error(OFFLINE_ERROR_MESSAGE))
    }

    this.peerBook.removeByB58String(peer.id.toB58String())
    this.swarm.hangUp(peer, callback)
  }

  this.handle = (protocol, handler) => {
    return this.swarm.handle(protocol, handler)
  }

  this.unhandle = (protocol) => {
    return this.swarm.unhandle(protocol)
  }

  this.discovery = new EE()
  this.routing = null
  this.records = null
}
