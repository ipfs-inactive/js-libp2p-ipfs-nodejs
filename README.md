# Deprecation Notice

This module has been deprecated in favour of:

- Consolidating examples for libp2p on js-libp2p
- Avoid duplication of code
- Reducing overhead in maintainece. Now the bundles live in js-ipfs itself, see - https://github.com/ipfs/js-ipfs/tree/master/src/core/runtime
- Now all of the tests live in https://github.com/libp2p/js-libp2p/tree/master/test

--------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------



![](https://github.com/libp2p/js-libp2p/raw/1e3e9db84d1e5fdd5682cc5e0fdaabfcd07ad55a/img/js-libp2p-ipfs.png?raw=true)

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/ipfs/js-libp2p-ipfs-nodejs.svg?style=flat-square)](https://travis-ci.org/ipfs/js-libp2p-ipfs-nodejs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-libp2p-ipfs-nodejs/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-libp2p-ipfs-nodejs?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-libp2p-ipfs-nodejs.svg?style=flat-square)](https://david-dm.org/ipfs/js-libp2p-ipfs-nodejs)
[![js-standard](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![standard-readme](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

> libp2p bundle (module) used in js-ipfs when run in Node.js. If you are looking for the browser version, see [libp2p-ipfs-browser](https://github.com/ipfs/js-libp2p-ipfs-browser)

This libp2p build has support for:

- TCP and WebSockets
- SPDY and mplex stream multiplexing
- secio encrypted channels
- Identify STUN protocol

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
- [Usage](#usage)
- [API](#api)
- [Examples](#examples)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm i libp2p-ipfs-nodejs
```

### Use in Node.js

```js
const Node = require('libp2p-ipfs-nodejs')
```

## Usage

### Create a libp2p-ipfs-nodejs node

```js
const PeerInfo = require('peer-info')
const Node = require('libp2p-ipfs-nodejs')
PeerInfo.create((err, pi) => {
  if (err) {
    throw err // handle the err
  }

  pi.multiaddr.add('/ip4/0.0.0.0/tcp/0')

  const node = new Node(pi)
  node.start((err) => {
    if (err) {
      throw err // handle the err
    }
    console.log('Node is ready o/')
  })
})
```

## API

API docs can be found at https://github.com/libp2p/js-libp2p#usage

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-libp2p-ipfs/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
