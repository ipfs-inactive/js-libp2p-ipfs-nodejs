'use strict'

const TCP = require('libp2p-tcp')
// const UTP = require('libp2p-utp')
const WebRTCStar = require('libp2p-webrtc-star')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const Railing = require('libp2p-railing')
const spdy = require('libp2p-spdy')
const multiplex = require('libp2p-multiplex')
const secio = require('libp2p-secio')
const libp2p = require('libp2p')

function mapMuxers (list) {
  return list.map((pref) => {
    if (typeof pref !== 'string') {
      return pref
    }
    switch (pref.trim().toLowerCase()) {
      case 'spdy':
        return spdy
      case 'multiplex':
        return multiplex
      default:
        throw new Error(pref + ' muxer not available')
    }
  })
}

function getMuxers (options) {
  if (process.env.LIBP2P_MUXER) {
    const muxerPrefs = process.env.LIBP2P_MUXER
    return mapMuxers(muxerPrefs.split(','))
  } else if (options) {
    return mapMuxers(options)
  } else {
    return [multiplex, spdy]
  }
}

class Node extends libp2p {
  constructor (peerInfo, peerBook, options) {
    options = options || {}
    const webRTCStar = new WebRTCStar()

    const modules = {
      transport: [
        new TCP(),
        new WS(),
        webRTCStar
      ],
      connection: {
        muxer: getMuxers(options.muxer),
        crypto: [
          secio
        ]
      },
      discovery: []
    }

    if (options.webRTCStar) {
      modules.discovery.push(webRTCStar.discovery)
    }

    if (options.mdns) {
      const mdns = new MulticastDNS(peerInfo, 'ipfs.local')
      modules.discovery.push(mdns)
    }

    if (options.bootstrap && process.env.IPFS_BOOTSTRAP) {
      const r = new Railing(options.bootstrap)
      modules.discovery.push(r)
    }

    super(modules, peerInfo, peerBook, options)
  }
}

module.exports = Node
