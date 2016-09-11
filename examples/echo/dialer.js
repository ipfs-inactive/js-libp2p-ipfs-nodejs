'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../src')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')

// Creation of PeerInfo of Dialer Node (this node)
const idDialer = PeerId.createFromJSON(require('./peer-id-dialer'))
const peerDialer = new PeerInfo(idDialer)
peerDialer.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
const nodeDialer = new libp2p.Node(peerDialer)

// Creation of PeerInfo of Listener Node
const idListener = PeerId.createFromJSON(require('./peer-id-listener'))
const peerListener = new PeerInfo(idListener)
peerListener.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/10333'))

nodeDialer.start((err) => {
  if (err) {
    throw err
  }

  console.log('Dialer ready, listening on:')

  peerListener.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + '/ipfs/' + idListener.toB58String())
  })

  nodeDialer.dialByPeerInfo(peerListener, '/echo/1.0.0', (err, conn) => {
    if (err) {
      throw err
    }
    console.log('nodeA dialed to nodeB on protocol: /echo/1.0.0')

    pull(
      pull.values(['hey']),
      conn,
      pull.through(console.log),
      pull.collect((err, data) => {
        if (err) {
          throw err
        }
        console.log('received echo:', data.toString())
      })
    )
  })
})
