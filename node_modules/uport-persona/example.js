// Example persona profile read
//
// node example.js

let Persona = require('./dist/persona.js').default
let Web3 = require('web3')
let ipfsApi = require('ipfs-api')

let myAddr = '0xbfe12cb358b9312fa28bb82cc48624efad314c1d'

let web3 = new Web3()
let web3Prov = new web3.providers.HttpProvider('https://consensysnet.infura.io:8545')
let ipfsProv = ipfsApi('localhost', 5001)

let persona = new Persona(myAddr, ipfsProv, web3Prov)

persona.load().then(() => {
  console.log(persona.getProfile())
})
