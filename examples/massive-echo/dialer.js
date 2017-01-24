'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Node = require('../../src')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
const async = require('async')
let idListener

const AMOUNT_OF_BYTES_TO_SEND = 1024 * 1024

async.parallel([
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-dialer'), (err, idDialer) => {
      if (err) {
        throw err
      }
      callback(null, idDialer)
    })
  },
  (callback) => {
    PeerId.createFromJSON(require('./peer-id-listener'), (err, idListener) => {
      if (err) {
        throw err
      }
      callback(null, idListener)
    })
  }
], (err, ids) => {
  if (err) throw err
  const peerDialer = new PeerInfo(ids[0])
  peerDialer.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
  const nodeDialer = new Node(peerDialer)

  const peerListener = new PeerInfo(ids[1])
  idListener = ids[1]

  let toDial = '/ip4/127.0.0.1/tcp/10333'

  if (process.argv[2] !== undefined) {
    toDial = process.argv[2]
  }

  peerListener.multiaddr.add(multiaddr(toDial))
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
        pull.values([
          new Array(AMOUNT_OF_BYTES_TO_SEND + 1).join('V')
        ]),
        conn,
        pull.drain((data) => {
          console.log('got data back!')
          console.log('length:' + data.length)
          if (data.length !== AMOUNT_OF_BYTES_TO_SEND) {
            throw new Error('Got different amount of data back')
          } else {
            console.log('data had the right length')
          }
        })
      )
    })
  })
})
