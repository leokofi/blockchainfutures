import {assert} from 'chai'
import MutablePersona from '../lib/mutablePersona.js'
import Persona from '../lib/persona.js'
import startProviders from './providerUtil'
import Web3 from 'web3'
import pudding from 'ether-pudding'

const web3 = new Web3()
pudding.setWeb3(web3)

import testData from './testData.json'

describe('Read and write to registry from Persona and MutablePersona', function () {
  this.timeout(30000)

  let persona, mutablePersona, registryAddress, accounts
  let web3Prov, ipfsProv, UportRegistry

  before((done) => {
    startProviders((err, provs) => {
      if (err) {
        throw new Error(err)
      }
      web3Prov = provs.web3Provider
      web3.setProvider(web3Prov)
      ipfsProv = provs.ipfsProvider

      // Setup for deployment of a new uport registry
      UportRegistry = require('uport-registry/environments/development/contracts/UportRegistry.sol.js').load(pudding)
      UportRegistry = pudding.whisk({binary: UportRegistry.binary, abi: UportRegistry.abi})

      web3.eth.getAccounts((err, accs) => {
        if (err) {
          throw new Error(err)
        }
        accounts = accs
        done()
      })
    })
  })

  it('Creates a persona object', (done) => {
    UportRegistry.new(accounts[0], {from: accounts[0]}).then((uportReg) => {
      registryAddress = uportReg.address
      mutablePersona = new MutablePersona(accounts[0], ipfsProv, web3Prov, registryAddress)
      assert.equal(mutablePersona.address, accounts[0])
      done()
    }).catch(done)
  })

  it('Write profile to registry', (done) => {
    mutablePersona.setPublicSigningKey(testData.privSignKey1)
    Object.keys(testData.profile).map(attrName => {
      const attribute = {}
      attribute[attrName] = testData.profile[attrName]

      return mutablePersona.addAttribute(attribute, testData.privSignKey1)
    })
    mutablePersona.setPublicSigningKey(testData.privSignKey1)
    mutablePersona.writeToRegistry().then((txHash) => {
      done()
    })
  })

  it('Correctly loads tokenRecords from uport registry', (done) => {
    var tmpRecords = mutablePersona.getAllClaims()
    persona = new Persona(accounts[0], ipfsProv, web3Prov, registryAddress)
    persona.load().then(() => {
      assert.deepEqual(tmpRecords, persona.getAllClaims())
      done()
    }).catch(done)
  })
})
