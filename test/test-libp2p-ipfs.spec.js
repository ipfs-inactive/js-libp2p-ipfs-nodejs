/* eslint-env mocha */

const expect = require('chai').expect
const libp2p = require('../src').Node
const Id = require('peer-id')
const Peer = require('peer-info')
const multiaddr = require('multiaddr')

describe('libp2p-ipfs', () => {
  const idA = Id.create()
  const idB = Id.create()
  const peerA = new Peer(idA)
  const peerB = new Peer(idB)

  var nodeA
  var nodeB

  it('prepare node A', (done) => {
    peerA.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/8010'))

    nodeA = libp2p(peerA)
    nodeA.start(done)
  })

  it('prepare node B', (done) => {
    peerB.multiaddr.add(multiaddr('/ip4/127.0.0.1/tcp/8020'))

    nodeB = libp2p(peerB)
    nodeB.start(done)
  })

  it('B handle /echo/1.0.0', (done) => {
    nodeB.swarm.handle('/echo/1.0.0', (conn) => {
      conn.pipe(conn)
    })
    done()
  })

  it('A dial B to speak /echo/1.0.0', (done) => {
    nodeA.swarm.dial(peerB, '/echo/1.0.0', (err, conn) => {
      expect(err).to.not.exist
      done()
    })
  })
})
