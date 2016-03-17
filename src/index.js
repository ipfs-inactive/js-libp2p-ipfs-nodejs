const Swarm = require('libp2p-swarm')
const Peer = require('peer-info')
const TCP = require('libp2p-tcp')
// const utp = require('libp2p-utp')
// const ws = require('libp2p-websockets')
const spdy = require('libp2p-spdy')
const multiaddr = require('multiaddr')

exports = module.exports

exports.Node = function Node (peerInfo) {
  if (!(this instanceof Node)) {
    return new Node(peerInfo)
  }
  if (!peerInfo) {
    peerInfo = new Peer()
    peerInfo.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
  }

  // Swarm
  this.swarm = new Swarm(peerInfo)
  this.swarm.transport.add('tcp', new TCP())
  this.swarm.connection.addStreamMuxer(spdy)
  this.swarm.connection.reuse()

  this.start = (callback) => {
    this.swarm.transport.listen('tcp', {}, null, callback)
  }
  this.routing = null
  this.records = null

  this.dial = () => {
    throw new Error('THIS WILL BE EQUIVALENT TO THE ROUTED HOST FEATURE, IT WILL FIGURE OUT EVERYTHING :D')
  }
}
