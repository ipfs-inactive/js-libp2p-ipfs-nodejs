'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../src')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')

PeerId.createFromJSON(require('./peer-id-listener'), (err, idListener) => {
  if (err) {
    throw err
  }
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

    nodeListener.handle('/chat/1.0.0', (protocol, conn) => {
      pull(
        conn,
        pull.collect((err, data) => {
          if (err) {
            throw err
          }
          console.log(data.toString())
        })
      )

      // Just a test
      pull(
        pull.values(['listener => dialer test']),
        conn
      )
    })

    console.log('Listener ready, listening on:')
    peerListener.multiaddrs.forEach((ma) => {
      console.log(ma.toString() + '/ipfs/' + idListener.toB58String())
    })
  })
})
