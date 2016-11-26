import {assert} from 'chai'
import Persona from '../lib/persona.js'
import testData from './testData.json'

describe('Persona', function () {
  this.timeout(30000)

  let persona

  it('Correctly verifies tokens', (done) => {
    assert.isTrue(Persona.isTokenValid(testData.validClaim))
    testData.invalidClaim.forEach((token) => {
      assert.isFalse(Persona.isTokenValid(token))
    })
    done()
  })

  it('Correctly converts private keys to public keys', (done) => {
    const pubSignKey = Persona.privateKeyToPublicKey(testData.privSignKey1)
    assert.equal(pubSignKey, testData.pubSignKey1_valid)
    assert.notEqual(pubSignKey, testData.pubSignKey1_invalid)
    done()
  })

  it('Creates a persona object', (done) => {
    persona = new Persona('myAddress', null, null)
    assert.equal(persona.address, 'myAddress')
    done()
  })

  it('Correctly loads tokenRecords from list of claims', (done) => {
    persona.load(testData.claimList).then(() => {
      assert.deepEqual(testData.claimList, persona.getAllClaims())
      done()
    }).catch(done)
  })

  it('Returns correct profile', (done) => {
    var p = persona.getProfile()
    delete p.pubSignKey
    delete p.pubEncKey
    assert.deepEqual(p, testData.profile)
    done()
  })

  it('Correctly returns requested claim', (done) => {
    let token = persona.getClaims('name')[0]
    assert.equal(token.decodedToken.payload.claim.name, testData.profile.name)
    token = persona.getClaims('dontExist')[0]
    assert.isUndefined(token)
    done()
  })

  it('Signs attribute correctly', (done) => {
    // should not be able to create claim without issuerId
    assert.throws(persona.signAttribute.bind(persona, testData.additionalAttribute, testData.privSignKey2), 'issuerId has to be set')
    // Create a claim that is signed by a third party
    let claim = persona.signAttribute(testData.additionalAttribute, testData.privSignKey2, testData.ethereumAddress)
    assert.isTrue(Persona.isTokenValid(claim))
    done()
  })
})
