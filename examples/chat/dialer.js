'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../src')
const multiaddr = require('multiaddr')
const pull = require('pull-stream')
// const toPull = require('stream-to-pull-stream')
const async = require('async')
const Pushable = require('pull-pushable')
const p = Pushable()
let idListener

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
  const nodeDialer = new libp2p.Node(peerDialer)

  const peerListener = new PeerInfo(ids[1])
  idListener = ids[1]
  peerListener.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/10333'))
  nodeDialer.start((err) => {
    if (err) {
      throw err
    }

    console.log('Dialer ready, listening on:')

    peerListener.multiaddrs.forEach((ma) => {
      console.log(ma.toString() + '/ipfs/' + idListener.toB58String())
    })

    nodeDialer.dialByPeerInfo(peerListener, '/chat/1.0.0', (err, conn) => {
      if (err) {
        throw err
      }
      console.log('nodeA dialed to nodeB on protocol: /chat/1.0.0')
      console.log('Type a message and see what happens')
      // Write operation. Data sent as a buffer
      pull(
        p,
        conn
      )
      // Sink, data converted from buffer to utf8 string
      pull(
        conn,
        pull.map((data) => {
          return data.toString('utf8').replace('\n', '')
        }),
        pull.drain(console.log)
      )

      process.stdin.setEncoding('utf8')
      process.openStdin().on('data', (chunk) => {
        var data = chunk.toString()
        p.push(data)
      })
    })
  })
})
