/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const parallel = require('async/parallel')
// const multiaddr = require('multiaddr')
// const pull = require('pull-stream')
const utils = require('./utils')
const createNode = utils.createNode
const echo = utils.echo

describe.skip('TCP + WebSockets', () => {
  let nodeTCP
  let nodeTCPnWS
  let nodeWS

  before((done) => {
    // TODO spawn three nodes
      // TCP
      // TCP + WebSockets
      // WebSockets
  })
  after((done) => {

  })

  before((done) => {
    parallel([
      (cb) => createNode([
        '/ip4/0.0.0.0/tcp/0'
      ], (err, node) => {
        expect(err).to.not.exist()
        nodeTCP = node
        node.handle('/echo/1.0.0', echo)
        node.start(cb)
      }),
      (cb) => createNode([
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/127.0.0.1/tcp/25011/ws'
      ], (err, node) => {
        expect(err).to.not.exist()
        nodeTCPnWS = node
        node.handle('/echo/1.0.0', echo)
        node.start(cb)
      }),
      (cb) => createNode([
        '/ip4/127.0.0.1/tcp/25022/ws'
      ], (err, node) => {
        expect(err).to.not.exist()
        nodeTCPnWS = node
        node.handle('/echo/1.0.0', echo)
        node.start(cb)
      })

    ], done)
  })

  after((done) => {
    parallel([
      (cb) => nodeTCP.stop(cb),
      (cb) => nodeTCPnWS.stop(cb),
      (cb) => nodeWS.stop(cb)
    ], done)
  })

  it.skip('nodeTCP.dial nodeTCPnWS using PeerInfo', (done) => {})
  it.skip('nodeTCP.hangUp nodeTCPnWS using PeerInfo', (done) => {})
  it.skip('nodeTCPnWS.dial nodeWS using PeerInfo', (done) => {})
  it.skip('nodeTCPnWS.hangUp nodeWS using PeerInfo', (done) => {})

  // Until https://github.com/libp2p/js-libp2p/issues/46 is resolved
  // Everynode will be able to dial in WebSockets
  it.skip('nodeTCP.dial nodeWS using PeerInfo is unsuccesful', (done) => {
    nodeTCP.dial(nodeWS.peerInfo, (err) => {
      expect(err).to.exist()
      done()
    })
  })
})
