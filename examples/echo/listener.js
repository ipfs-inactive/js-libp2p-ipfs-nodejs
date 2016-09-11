'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../src')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')

const idListener = PeerId.createFromJSON(require('./peer-id-listener'))
const peerListener = new PeerInfo(idListener)
peerListener.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/10333'))
const nodeListener = new libp2p.Node(peerListener)

nodeListener.start((err) => {
  if (err) {
    throw err
  }

  nodeListener.swarm.on('peer-mux-established', (peerInfo) => {
    console.log(peerInfo.id.toB58String())
  })

  nodeListener.handle('/echo/1.0.0', (conn) => {
    pull(
      conn,
      conn
    )
  })

  nodeListener.handle('/hello/1.0.0', (conn) => {
    pull(
      pull.values(['hello', 'world']),
      conn
    )
    setTimeout(() => {
      console.log('Printing my peerbook')
      Object
        .keys(nodeListener.peerBook.getAll())
        .forEach(console.log)
    }, 500)
  })

  console.log('Listener ready, listening on:')

  peerListener.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + '/ipfs/' + idListener.toB58String())
  })
})
