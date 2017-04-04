/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const parallel = require('async/parallel')
const utils = require('./utils')
const createNode = utils.createNode
const _times = require('lodash.times')

describe('.peerRouting', () => {
  let nodeA
  let nodeB
  let nodeC
  let nodeD
  let nodeE

  before((done) => {
    const tasks = _times(5, () => (cb) => {
      createNode('/ip4/0.0.0.0/tcp/0', (err, node) => {
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
})
