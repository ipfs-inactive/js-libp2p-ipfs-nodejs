/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const parallel = require('async/parallel')
const utils = require('./utils')
const createNode = utils.createNode
const _times = require('lodash.times')

describe.only('.peerRouting', () => {
  let nodeA
  let nodeB
  let nodeC
  let nodeD
  let nodeE

  before((done) => {
    const tasks = _times(5, () => (cb) => {
      createNode('/ip4/0.0.0.0/tcp/0', { mdns: false }, (err, node) => {
        expect(err).to.not.exist()
        node.start((err) => cb(err, node))
      })
    })

    parallel(tasks, (err, nodes) => {
      expect(err).to.not.exist()
      nodeA = nodes[0]
      nodeB = nodes[1]
      nodeC = nodes[2]
      nodeD = nodes[3]
      nodeE = nodes[4]

      parallel([
        (cb) => nodeA.dial(nodeB.peerInfo, cb),
        (cb) => nodeB.dial(nodeC.peerInfo, cb),
        (cb) => nodeC.dial(nodeD.peerInfo, cb),
        (cb) => nodeD.dial(nodeE.peerInfo, cb),
        (cb) => nodeE.dial(nodeA.peerInfo, cb)
      ], done)
    })
  })

  after((done) => {
    parallel([
      (cb) => nodeA.stop(cb),
      (cb) => nodeB.stop(cb),
      (cb) => nodeC.stop(cb),
      (cb) => nodeD.stop(cb),
      (cb) => nodeE.stop(cb)
    ], done)
  })

  describe('el ring', () => {
    it('time', (done) => setTimeout(done, 5000))

    it('nodeA.dial by Id to node C', (done) => {
      nodeA.dial(nodeC.peerInfo.id, done)
    })

    it.skip('nodeB.dial by Id to node D', (done) => {})
    it.skip('nodeC.dial by Id to node E', (done) => {})
    it.skip('nodeB.peerRouting.findPeer(nodeE.peerInfo.id)', (done) => {})
  })
})
