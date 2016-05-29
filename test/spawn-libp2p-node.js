#! /usr/bin/env node

'use strict'

const libp2p = require('../src')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const multiaddr = require('multiaddr')

const idBak = require('./test-data/test-id.json')

const pInfo = new PeerInfo(PeerId.createFromJSON(idBak))
const maddr = multiaddr('/ip4/127.0.0.1/tcp/12345')

pInfo.multiaddr.add(maddr)

const node = new libp2p.Node(pInfo)

node.handle('/echo/1.0.0', (conn) => {
  conn.pipe(conn)
})

node.start((err) => {
  if (err) {
    throw err
  }
  console.log('Spawned node started')
})
