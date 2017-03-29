/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
// const expect = chai.expect
// const parallel = require('async/parallel')
// const series = require('async/series')
// const map = require('async/map')
// const pull = require('pull-stream')
// const utils = require('./utils')
// const createNode = utils.createNode
// const echo = utils.echo

describe.skip('stream muxing', (done) => {
  it.skip('spdy only', (done) => {})
  it.skip('multiplex only', (done) => {})
  it.skip('spdy + multiplex', (done) => {})
  it.skip('spdy + multiplex switched order', (done) => {})

  /*
  it.skip('create libp2pNode with multiplex only', (done) => {
    const old = process.env.LIBP2P_MUXER
    process.env.LIBP2P_MUXER = ''

    PeerInfo.create((err, info) => {
      expect(err).to.not.exist()
      const b = new Node(info, null, { muxer: ['multiplex'] })
      expect(b.modules.connection.muxer).to.eql([
        require('libp2p-multiplex')
      ])

      if (old) {
        process.env.LIBP2P_MUXER = old
      }
      done()
    })
  })
  */
})
