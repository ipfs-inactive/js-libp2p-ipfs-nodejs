/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const Node = require('../src')
const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const parallel = require('async/parallel')
const series = require('async/series')
const waterfall = require('async/waterfall')
const multiaddr = require('multiaddr')
const spawn = require('child_process').spawn
const path = require('path')
// const map = require('async/map')
const pull = require('pull-stream')
const signalling = require('libp2p-webrtc-star/src/sig-server')

function createNode (multiaddrs, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  if (!Array.isArray(multiaddrs)) {
    multiaddrs = [multiaddrs]
  }

  waterfall([
    (cb) => PeerId.create({ bits: 1024 }, cb),
    (peerId, cb) => PeerInfo.create(peerId, cb),
    (peerInfo, cb) => {
      multiaddrs.map((ma) => peerInfo.multiaddr.add(ma))
      cb(null, peerInfo)
    },
    (peerInfo, cb) => {
      const node = new Node(peerInfo, undefined, options)
      cb(null, node)
    }
  ], callback)
}

function echo (protocol, conn) {
  pull(conn, conn)
}

describe('libp2p-ipfs-nodejs', () => {
  describe('TCP only', () => {
    let nodeA
    let nodeB

    before((done) => {
      parallel([
        (cb) => createNode('/ip4/0.0.0.0/tcp/0', (err, node) => {
          expect(err).to.not.exist()
          nodeA = node
          node.handle('/echo/1.0.0', echo)
          node.start(cb)
        }),
        (cb) => createNode('/ip4/0.0.0.0/tcp/0', (err, node) => {
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

    it('nodeA.dial nodeB using PeerInfo without proto (warmup)', (done) => {
      nodeA.dial(nodeB.peerInfo, (err) => {
        expect(err).to.not.exist()

        // Some time for Identify to finish
        setTimeout(check, 500)

        function check () {
          parallel([
            (cb) => {
              const peers = nodeA.peerBook.getAll()
              expect(err).to.not.exist()
              expect(Object.keys(peers)).to.have.length(1)
              cb()
            },
            (cb) => {
              const peers = nodeB.peerBook.getAll()
              expect(err).to.not.exist()
              expect(Object.keys(peers)).to.have.length(1)
              cb()
            }
          ], done)
        }
      })
    })

    it('nodeA.dial nodeB using PeerInfo', (done) => {
      nodeA.dial(nodeB.peerInfo, '/echo/1.0.0', (err, conn) => {
        expect(err).to.not.exist()

        pull(
          pull.values([new Buffer('hey')]),
          conn,
          pull.collect((err, data) => {
            expect(err).to.not.exist()
            expect(data).to.be.eql([new Buffer('hey')])
            done()
          })
        )
      })
    })

    it('nodeA.hangUp nodeB using PeerInfo (first)', (done) => {
      nodeA.hangUp(nodeB.peerInfo, (err) => {
        expect(err).to.not.exist()
        setTimeout(check, 500)

        function check () {
          parallel([
            (cb) => {
              const peers = nodeA.peerBook.getAll()
              expect(err).to.not.exist()
              expect(Object.keys(peers)).to.have.length(0)
              expect(Object.keys(nodeA.swarm.muxedConns)).to.have.length(0)

              cb()
            },
            (cb) => {
              const peers = nodeB.peerBook.getAll()
              expect(err).to.not.exist()
              expect(Object.keys(peers)).to.have.length(0)
              expect(Object.keys(nodeB.swarm.muxedConns)).to.have.length(0)
              cb()
            }
          ], done)
        }
      })
    })

    it('nodeA.dial nodeB using multiaddr', (done) => {
      const nodeBMultiaddr = multiaddr(
        nodeB.peerInfo.multiaddrs[0].toString() +
        '/ipfs/' + nodeB.peerInfo.id.toB58String()
      )

      console.log(nodeBMultiaddr.toString())

      nodeA.on('peer:connect', (peer) => {
        console.log('A got peer')
      })

      nodeB.on('peer:connect', (peer) => {
        console.log('B got peer')
      })

      nodeA.dial(nodeBMultiaddr, '/echo/1.0.0', (err, conn) => {
        // Some time for Identify to finish
        setTimeout(check, 500)

        function check () {
          expect(err).to.not.exist()
          series([
            (cb) => {
              const peers = nodeA.peerBook.getAll()
              expect(err).to.not.exist()
              expect(Object.keys(peers)).to.have.length(1)
              cb()
            },
            (cb) => {
              const peers = nodeB.peerBook.getAll()
              expect(err).to.not.exist()
              expect(Object.keys(peers)).to.have.length(1)
              cb()
            }
          ], () => {
            pull(
              pull.values([new Buffer('hey')]),
              conn,
              pull.collect((err, data) => {
                expect(err).to.not.exist()
                expect(data).to.be.eql([new Buffer('hey')])
                done()
              })
            )
          })
        }
      })
    })

    it('nodeA.hangUp nodeB using multiaddr (second)', (done) => {
      const nodeBMultiaddr = multiaddr(
        nodeB.peerInfo.multiaddrs[0].toString() +
        '/ipfs/' + nodeB.peerInfo.id.toB58String()
      )

      nodeA.hangUp(nodeBMultiaddr, (err) => {
        expect(err).to.not.exist()
        setTimeout(check, 500)

        function check () {
          parallel([
            (cb) => {
              const peers = nodeA.peerBook.getAll()
              expect(err).to.not.exist()
              expect(Object.keys(peers)).to.have.length(0)
              expect(Object.keys(nodeA.swarm.muxedConns)).to.have.length(0)

              cb()
            },
            (cb) => {
              const peers = nodeB.peerBook.getAll()
              expect(err).to.not.exist()
              expect(Object.keys(peers)).to.have.length(0)
              expect(Object.keys(nodeB.swarm.muxedConns)).to.have.length(0)
              cb()
            }
          ], done)
        }
      })
    })

    // TODO for when we preserve the contact in peerInfo
    it.skip('nodeA.dial nodeB using PeerId', (done) => {})
    it.skip('nodeA.hangUp nodeB using PeerId (third)', (done) => {})
  })

  describe.skip('TCP + WebSockets', () => {
    let nodeTCP
    let nodeWS

    before((done) => {
      // TODO spawn three nodes
        // TCP
        // TCP + WebSockets
        // WebSockets
    })
    after((done) => {

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
        const peers = nodeTCP.peerBook.getAll()
        expect(Object.keys(peers)).to.have.length(3)
        done()
      })
    })
  })

  describe.skip('TCP + WebSockets + WebRTCStar', () => {
    let ss

    before((done) => {
      signalling.start({ port: 24642 }, (err, server) => {
        expect(err).to.not.exist()
        ss = server
        done()
      })

      // TODO start 4 nodes:
      //   1 - TCP + WebSockets + WebRTCStar
      //   2 - TCP only
      //   3 - WebSockets only
      //   4 - WebRTCStar only
    })

    after((done) => ss.stop(done))

    it.skip('nodeAll.dial nodeTCP using PeerInfo', (done) => {})
    it.skip('nodeAll.hangUp nodeTCP using PeerInfo', (done) => {})
    it.skip('nodeAll.dial nodeWS using PeerInfo', (done) => {})
    it.skip('nodeAll.hangUp nodeWS using PeerInfo', (done) => {})
    it.skip('nodeAll.dial nodeWS using PeerInfo', (done) => {})
    it.skip('nodeAll.hangUp nodeWebRTCStar using PeerInfo', (done) => {})
  })

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

  describe.skip('discovery', () => {
    let nodeA
    let nodeB

    it.skip('MulticastDNS', (done) => {
      nodeA.once('peer:discovery', (peerInfo) => {
        expect(nodeB.peerInfo.id.toB58String())
          .to.eql(peerInfo.id.toB58String())
        done()
      })
    })

    it.skip('WebRTCStar', (done) => {})
    it.skip('MulticastDNS + WebRTCStar', (done) => {})
  })

  describe('Turbolence tests', () => {
    let nodeA
    let nodeSpawn

    before((done) => {
      createNode('/ip4/0.0.0.0/tcp/0', (err, node) => {
        expect(err).to.not.exist()
        nodeA = node
        node.handle('/echo/1.0.0', echo)
        node.start(done)
      })
    })

    after((done) => nodeA.stop(done))

    it('spawn a node in a different process', (done) => {
      const filePath = path.join(__dirname, './spawn-libp2p-node.js')

      nodeSpawn = spawn(filePath, { env: process.env })

      let spawned = false

      nodeSpawn.stdout.on('data', (data) => {
        // console.log(data.toString())
        if (!spawned) {
          spawned = true
          done()
        }
      })

      nodeSpawn.stderr.on('data', (data) => console.log(data.toString()))
    })

    it('connect nodeA to that node', (done) => {
      if (process.env.LIBP2P_MUXER === 'multiplex') {
        return done() // TODO figure out why this fails in isolation
      }

      const spawnedId = require('./test-data/test-id.json')
      const maddr = multiaddr('/ip4/127.0.0.1/tcp/12345/ipfs/' + spawnedId.id)

      nodeA.dial(maddr, '/echo/1.0.0', (err, conn) => {
        expect(err).to.not.exist()
        const peers = nodeA.peerBook.getAll()

        expect(Object.keys(peers)).to.have.length(1)

        pull(
          pull.values([new Buffer('hey')]),
          conn,
          pull.collect((err, data) => {
            expect(err).to.not.exist()
            expect(data).to.eql([new Buffer('hey')])
            done()
          })
        )
      })
    })

    it('crash that node, ensure nodeA continues going steady', (done) => {
      nodeSpawn.kill('SIGKILL')
      setTimeout(check, 5000)

      function check () {
        const peers = nodeA.peerBook.getAll()
        expect(Object.keys(peers)).to.have.length(0)
        done()
      }
    })
  })

  // const maddrWS1 = multiaddr('/ip4/127.0.0.1/tcp/25001/ws')
  // const maddrWS2 = multiaddr('/ip4/127.0.0.1/tcp/25002/ws')

  // WebRTCStar addr, make them not need ipfs id to be passed
  // const nodeGMultiaddrWebRTCStar = multiaddr(
  //        '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/24642/ws' +
  //        '/ipfs/' + nodeG.peerInfo.id.toB58String())
  //    nodeG.peerInfo.multiaddr.add(nodeGMultiaddrWebRTCStar)

  //    nodeHMultiaddrWebRTCStar = multiaddr(
  //        '/libp2p-webrtc-star/ip4/127.0.0.1/tcp/24642/ws' +
  //        '/ipfs/' + nodeH.peerInfo.id.toB58String())
  //    nodeH.peerInfo.multiaddr.add(nodeHMultiaddrWebRTCStar)

  /* Double check this, they should have been updated
  it('extract TCP multiaddr', () => {
    nodeAMultiaddrTCP = multiaddr((
      nodeA.peerInfo.multiaddrs[0].toString() +
      '/ipfs/' + nodeA.peerInfo.id.toB58String()
      ).replace('0.0.0.0', '127.0.0.1')
    )
    nodeBMultiaddrTCP = multiaddr((
      nodeB.peerInfo.multiaddrs[0].toString() +
      '/ipfs/' + nodeB.peerInfo.id.toB58String()
      ).replace('0.0.0.0', '127.0.0.1')

    )
    nodeCMultiaddrTCP = multiaddr((
      nodeC.peerInfo.multiaddrs[0].toString() +
      '/ipfs/' + nodeC.peerInfo.id.toB58String()
      ).replace('0.0.0.0', '127.0.0.1')

    )
    nodeDMultiaddrTCP = multiaddr((
      nodeD.peerInfo.multiaddrs[0].toString() +
      '/ipfs/' + nodeD.peerInfo.id.toB58String()
      ).replace('0.0.0.0', '127.0.0.1')
    )

    // Note: Here is the multiaddrs[1] again because
    // the .replace in swarm switches the order of
    // the TCP and WS addr
    nodeEMultiaddrTCP = multiaddr((
      nodeE.peerInfo.multiaddrs[1].toString() +
      '/ipfs/' + nodeE.peerInfo.id.toB58String()
      ).replace('0.0.0.0', '127.0.0.1')
    )
  })
  */
})
