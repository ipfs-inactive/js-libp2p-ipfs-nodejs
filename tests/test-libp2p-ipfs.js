/* globals describe, it */

const expect = require('chai').expect
const libp2p = require('../src')
const Id = require('peer-id')
const Peer = require('peer-info')
const multiaddr = require('multiaddr')

describe('libp2p-ipfs', () => {
  const idA = Id.create()
  const idB = Id.create()
  const peerA = new Peer(idA, [])
  const peerB = new Peer(idB, [])

  var nodeA
  var nodeB

  it('prepare node A', (done) => {
    const options = {
      peer: peerA,
      multiaddrs: {
        tcp: multiaddr('/ip4/127.0.0.1/tcp/8010')
      }
    }

    nodeA = libp2p(options)
    nodeA.listen((err) => {
      expect(err).to.not.exist
      done()
    })
  })
  it('prepare node B', (done) => {
    const options = {
      peer: peerB,
      multiaddrs: {
        tcp: multiaddr('/ip4/127.0.0.1/tcp/8020')
      }
    }

    nodeB = libp2p(options)
    nodeB.listen((err) => {
      expect(err).to.not.exist
      done()
    })
  })

  it('B handle /echo/1.0.0', (done) => {
    nodeB.swarm.handleProtocol('/echo/1.0.0', (conn) => {
      conn.pipe(conn)
    })
    done()
  })

  it('A dial B to speak /echo/1.0.0', (done) => {
    nodeA.swarm.dial(peerB, {}, '/echo/1.0.0', (err, conn) => {
      expect(err).to.not.exist
      done()
    })
  })
})
