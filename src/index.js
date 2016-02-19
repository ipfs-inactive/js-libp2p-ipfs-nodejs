const Swarm = require('libp2p-swarm')
const tcp = require('libp2p-tcp')
// const utp = require('libp2p-utp')
var Spdy = require('libp2p-spdy')

exports = module.exports = libp2p

function libp2p (options) {
  // options.peer - my Peer Info
  // options.multiaddrs = { tcp: <multiaddr> , utp: <multiaddr>}
  //
  const swarm = new Swarm(options.peer)
  swarm.addStreamMuxer('spdy', Spdy, {})

  return {
    listen: (callback) => {
      // add the transports
      // spdy and stuff
      swarm.addTransport('tcp',
        tcp,
        { multiaddr: options.multiaddrs.tcp },
        {},
        { port: options.multiaddrs.tcp.toString().split('/')[4] },
        () => {
          callback()
        })
    },
    records: '',
    routing: '',
    swarm: swarm
  }
}
