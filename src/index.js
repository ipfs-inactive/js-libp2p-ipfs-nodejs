'use strict'

const TCP = require('libp2p-tcp')
// const UTP = require('libp2p-utp')
const WebRTCStar = require('libp2p-webrtc-star')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const spdy = require('libp2p-spdy')
const multiplex = require('libp2p-multiplex')
const secio = require('libp2p-secio')
const libp2p = require('libp2p')

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
        muxer: process.env.LIBP2P_MUXER ? (() => {
          const muxerPrefs = process.env.LIBP2P_MUXER
          return muxerPrefs.split(',').map((pref) => {
            switch (pref) {
              case 'spdy': return spdy
              case 'multiplex': return multiplex
              default: throw new Error(pref + ' muxer not available')
            }
          })
        })() : [spdy],
        crypto: [
          secio
        ]
      },
      discovery: [
        webRTCStar.discovery
      ]
    }

    if (options.mdns) {
      modules.discovery.push(new MulticastDNS(peerInfo, 'ipfs.local'))
    }

    super(modules, peerInfo, peerBook, options)
  }
}

module.exports = Node
