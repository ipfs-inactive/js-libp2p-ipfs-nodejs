/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const parallel = require('async/parallel')
const utils = require('./utils')
const createNode = utils.createNode
const echo = utils.echo

describe('discovery', () => {
  let nodeA
  let nodeB

  before((done) => {
    parallel([
      (cb) => createNode('/ip4/0.0.0.0/tcp/0', { mdns: true }, (err, node) => {
        expect(err).to.not.exist()
        nodeA = node
        node.handle('/echo/1.0.0', echo)
        node.start(cb)
      }),
      (cb) => createNode('/ip4/0.0.0.0/tcp/0', { mdns: true }, (err, node) => {
        expect(err).to.not.exist()
        nodeB = node
        node.handle('/echo/1.0.0', echo)
        node.start(cb)
      })
    ], done)
  })

  after((done) => {
    parallel([
      (cb) => nodeA.stop(cb),
      (cb) => nodeB.stop(cb)
    ], done)
  })

  it('MulticastDNS', (done) => {
    nodeA.once('peer:discovery', (peerInfo) => {
      expect(nodeB.peerInfo.id.toB58String())
        .to.eql(peerInfo.id.toB58String())
      done()
    })
  })

  it.skip('WebRTCStar', (done) => {})
  it.skip('MulticastDNS + WebRTCStar', (done) => {})
})
