const Peer = require('peer-info')
const libp2p = require('../src')
const multiaddr = require('multiaddr')

const peerA = new Peer()
peerA.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
const nodeA = new libp2p.Node(peerA)

const peerB = new Peer()
peerB.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
const nodeB = new libp2p.Node(peerB)

nodeA.start(() => {})
nodeB.start(() => {})

setTimeout(establishConn, 1000)

function establishConn () {
  console.log('nodeA listening on', peerA.multiaddrs[0].toString())
  console.log('nodeB listening on', peerB.multiaddrs[0].toString())

  nodeB.swarm.handle('/echo/1.0.0', (conn) => {
    conn.on('data', (data) => {
      console.log(data.toString())
      conn.write(data)
    })

    conn.on('end', () => {
      conn.end()
    })
  })

  nodeA.swarm.dial(peerB, '/echo/1.0.0', (err, conn) => {
    if (err) {
      throw err
    }
    console.log('nodeA dialed to nodeB on protocol: /echo/1.0.0')

    conn.on('data', (data) => {
      console.log('echo back', data.toString())
      conn.write(data)
    })

    conn.write('hey')

    conn.end()

    conn.on('end', process.exit)
  })
}
