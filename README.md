libp2p-ipfs
===========

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/ipfs/js-libp2p-ipfs.svg?style=flat-square)](https://travis-ci.org/ipfs/js-libp2p-ipfs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-libp2p-ipfs/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-libp2p-ipfs?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-libp2p-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-libp2p-ipfs)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)


> libp2p build (module) used in js-ipfs

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
> npm i libp2p-ipfs
```

### Use in Node.js

```js
const lip2p = require('libp2p-ipfs')
```

## Usage

## API

## Examples

- Start two libp2p Nodes (create and make them listen)
- Set up a handler for a protocol (through multistream)
- Dial from one Node to the other using just one transport (TCP or uTP, and without SPDY or Yamux)
- Dial from one Node to the other using one transport and one Stream Multiplexer
- Dial from one Node to the other having set up secio

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-libp2p-ipfs/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
