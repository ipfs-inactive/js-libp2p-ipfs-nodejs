'use strict'

const TCP = require('libp2p-tcp')
// const UTP = require('libp2p-utp')
const WS = require('libp2p-websockets')
const spdy = require('libp2p-spdy')
const secio = require('libp2p-secio')
const libp2p = require('libp2p')

class Node extends libp2p {
  constructor (peerInfo, peerBook) {
    const modules = {
      transport: [
        new TCP(),
        new WS()
      ],
      connection: {
        muxer: [
          spdy
        ],
        crypto: [
          secio
        ]
      },
      discovery: []
    }
    super(modules, peerInfo, peerBook)
  }
}

module.exports = Node
