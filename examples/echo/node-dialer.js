'use strict'
/* eslint-disable no-console */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const libp2p = require('../../src')
const multiaddr = require('multiaddr')

const privateKeyA = 'CAASpAkwggSgAgEAAoIBAQCwJRMRUmQFEr1Y+JUm2A2IEZbGUbHi/D3+SQ5UQLVA561DOHpCNR8gd/3VlniuOrKVpBlZETSmx5tWhXkyvEzfzzP0+0oOK/60nRdDRhCs7xwBi0gZk3uHiEao1T8+x2YUz7XQYNCgXHN1ouSTtFRrI2ub5Zj4QPpc6tSmTczyziYgCYskT5VRxEfWts8R4LzJDhGSZUhZMEEEXSsI1nBXyNS4W81WmnCizidgIpxWM5GnUA5H+TNQ5qkEO78E4vOKjj44Nk6OUpfGwwdt2iTWIakrdme+mdcLAeXiwud3cv3P8d7YJYOjW8M/CTizmvU03IiA3m12AR0mbbY/7qHrAgMBAAECggEAJ6xiDA+7mWzsGuL6bSJSgeg8RnTWFSLtL53yzUU5zeGgo7hPySO/3AdKs9XNXqi32n54exgl/L6OnUE42BWTVwGLWU1UE7cTCkkrmSppzRmZ/DsLxT7znsYx7AsD0LcGpf9WmxWDR+sq0j8bLq16KhtzPEzNVHUGLvFxbfeuBq3KLhvma7cp0I22dbgVZ3DTA5SJWiGrZNjXrzH69MFu8TMiaGhRSqqP4LWWoZq/xwMjNtQrMAL5CVg4Vr9UYd8unKvLMpvMaA7wescpKj0Hgh32kyCiIRiTEKhuZgYxy+jK/681l55VTYvCyzOE7kXBqMgThI7agUwItedv9UAiMQKBgQDcKe4iTtjyDr304gEnvPXO2QzMzmzCo5strRHOGziF7qKo0N7ZxdHgnD9tRuvsA69On70Mpph3N6ds6vjvedPP9EO72bKTqHP2c0m5UIkXBFef39aRWLLvQmRLW86TifNc6s9rEDvPAwBJtYTmz1hgcSP09yfg4EHF74kCfOAu2QKBgQDM0OeqiSlUr4NrOoXn/qHfcvhAXbvCuvjOULFJAXNTlcV01um270m5TBhJI+Pr3W9/kxePAeONWo5pOcjr/+Od9jm5N9b56FOMHtgV6pFQbnC5p6AX2vAK2N/wimDG1zPbyJoLdzwNLo0shH/TZTphCdNz6SC4zpai887eqBYkYwKBgALaJDSbkuHn4PwYJW2vW/vXAfxxPCV1WyBHWrCx15Scl8zaD9kAYAyp2YR/47SGA7JgDWHpkpYQyYF2tczcZisOfgYj9tVE3GO38J+O9IewzbXLf4sYfBDvaj8zrERrCBUPEarQZgXzgwBxcoxO6VUuggm9Xe3i2ddHmB3JIlpZAn9tm15e5Qg5SbQKrkb64EnASsaPq5nPnD+KKaS2bRBKqtwAqwJn46aQgyh7+7j9gIMqwozY+ynLe6q6pTHhGg+1eQ9rD3b8RlhvpBH/qIgbgv7QW+RQ39mV9HnjQCqKPqCB/dhySlzYsRDbwgymFIYpaBjA7wGT5Pq4OcF7ZnhzAoGAIzHjYXZQcxFN7gOUm/bnXb+OuLnvdBaKzF1CFxeTy4gJmf7Jn9GEcJQQCehVpaJGAd2+hRM1fkZwPqtScnGEVSpNkU3IeTG7nCFVcP14o4eMLC9tMJNC7Ul8hjPqlhVEgS5cCDOOhdqkYY1jdvVGnRSjEDua4eSxA7OJjyMEcFc='

const privateKeyB = 'CAASpgkwggSiAgEAAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAECggEAZtju/bcKvKFPz0mkHiaJcpycy9STKphorpCT83srBVQi59CdFU6Mj+aL/xt0kCPMVigJw8P3/YCEJ9J+rS8BsoWE+xWUEsJvtXoT7vzPHaAtM3ci1HZd302Mz1+GgS8Epdx+7F5p80XAFLDUnELzOzKftvWGZmWfSeDnslwVONkL/1VAzwKy7Ce6hk4SxRE7l2NE2OklSHOzCGU1f78ZzVYKSnS5Ag9YrGjOAmTOXDbKNKN/qIorAQ1bovzGoCwx3iGIatQKFOxyVCyO1PsJYT7JO+kZbhBWRRE+L7l+ppPER9bdLFxs1t5CrKc078h+wuUr05S1P1JjXk68pk3+kQKBgQDeK8AR11373Mzib6uzpjGzgNRMzdYNuExWjxyxAzz53NAR7zrPHvXvfIqjDScLJ4NcRO2TddhXAfZoOPVH5k4PJHKLBPKuXZpWlookCAyENY7+Pd55S8r+a+MusrMagYNljb5WbVTgN8cgdpim9lbbIFlpN6SZaVjLQL3J8TWH6wKBgQDSChzItkqWX11CNstJ9zJyUE20I7LrpyBJNgG1gtvz3ZMUQCn3PxxHtQzN9n1P0mSSYs+jBKPuoSyYLt1wwe10/lpgL4rkKWU3/m1Myt0tveJ9WcqHh6tzcAbb/fXpUFT/o4SWDimWkPkuCb+8j//2yiXk0a/T2f36zKMuZvujqQKBgC6B7BAQDG2H2B/ijofp12ejJU36nL98gAZyqOfpLJ+FeMz4TlBDQ+phIMhnHXA5UkdDapQ+zA3SrFk+6yGk9Vw4Hf46B+82SvOrSbmnMa+PYqKYIvUzR4gg34rL/7AhwnbEyD5hXq4dHwMNsIDq+l2elPjwm/U9V0gdAl2+r50HAoGALtsKqMvhv8HucAMBPrLikhXP/8um8mMKFMrzfqZ+otxfHzlhI0L08Bo3jQrb0Z7ByNY6M8epOmbCKADsbWcVre/AAY0ZkuSZK/CaOXNX/AhMKmKJh8qAOPRY02LIJRBCpfS4czEdnfUhYV/TYiFNnKRj57PPYZdTzUsxa/yVTmECgYBr7slQEjb5Onn5mZnGDh+72BxLNdgwBkhO0OCdpdISqk0F0Pxby22DFOKXZEpiyI9XYP1C8wPiJsShGm2yEwBPWXnrrZNWczaVuCbXHrZkWQogBDG3HGXNdU4MAWCyiYlyinIBpPpoAJZSzpGLmWbMWh28+RJS6AQX6KHrK1o2uw=='

// Creation of PeerInfo of Dialer Node (this node)
const idA = PeerId.createFromPrivKey(privateKeyA)
const peerA = new PeerInfo(idA)
peerA.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/0'))
const nodeA = new libp2p.Node(peerA)

// Creation of PeerInfo of Listener Node
const idB = PeerId.createFromPrivKey(privateKeyB)
const peerB = new PeerInfo(idB)
peerB.multiaddr.add(multiaddr('/ip4/0.0.0.0/tcp/10333'))

nodeA.start((err) => {
  if (err) {
    throw err
  }
  console.log('Dialer node is ready')
  console.log('->', peerA.multiaddrs[0].toString())
  console.log('->', peerA.id.toB58String())

  nodeA.dialByPeerInfo(peerB, '/echo/1.0.0', (err, conn) => {
    if (err) {
      throw err
    }
    console.log('nodeA dialed to nodeB on protocol: /echo/1.0.0')

    conn.on('data', (data) => {
      console.log('echo back', data.toString())
    })

    conn.write('hey')
    conn.end()
    conn.on('end', process.exit)
  })
})
