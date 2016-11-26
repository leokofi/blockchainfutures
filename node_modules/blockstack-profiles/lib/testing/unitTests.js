'use strict';

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _blockstackKeychains = require('blockstack-keychains');

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var privateKeychain = new _blockstackKeychains.PrivateKeychain(),
    publicKeychain = privateKeychain.publicKeychain();

var sampleProfiles = {
  balloonDog: JSON.parse(_fs2.default.readFileSync('./docs/profiles/balloonDog.json')),
  naval: JSON.parse(_fs2.default.readFileSync('./docs/profiles/naval.json')),
  google: JSON.parse(_fs2.default.readFileSync('./docs/profiles/google.json')),
  navalLegacy: JSON.parse(_fs2.default.readFileSync('./docs/profiles/naval-legacy.json'))
};
var sampleTokenFiles = {
  ryan_apr20: JSON.parse(_fs2.default.readFileSync('./docs/testTokenFiles/ryan_apr20.json'))
};

function testTokening(filename, profile) {
  var tokenRecords = [];

  (0, _tape2.default)('profileToToken', function (t) {
    t.plan(3);

    var privateKey = privateKeychain.privateKey('hex'),
        publicKey = publicKeychain.publicKey('hex');

    var token = (0, _index.signToken)(profile, privateKey, { publicKey: publicKey });
    t.ok(token, 'Token must have been created');
    var tokenRecord = (0, _index.wrapToken)(token);
    t.ok(tokenRecord, 'Token record must have been created');

    var decodedToken = (0, _index.verifyTokenRecord)(tokenRecord, publicKey);
    t.ok(decodedToken, 'Token record must have been verified');
  });

  (0, _tape2.default)('profileToTokens', function (t) {
    t.plan(2);

    tokenRecords = (0, _index.signTokenRecords)([profile], privateKeychain);
    t.ok(tokenRecords, 'Tokens should have been created');
    //console.log(JSON.stringify(tokenRecords, null, 2))
    _fs2.default.writeFileSync('./docs/tokenfiles/' + filename, JSON.stringify(tokenRecords, null, 2));

    var tokensVerified = true;
    tokenRecords.map(function (tokenRecord) {
      var decodedToken = (0, _index.verifyTokenRecord)(tokenRecord, publicKeychain);
    });
    t.equal(tokensVerified, true, 'All tokens should be valid');
  });

  (0, _tape2.default)('tokensToProfile', function (t) {
    t.plan(2);

    var recoveredProfile = (0, _index.getProfileFromTokens)(tokenRecords, publicKeychain);
    //console.log(recoveredProfile)
    t.ok(recoveredProfile, 'Profile should have been reconstructed');
    t.equal(JSON.stringify(recoveredProfile), JSON.stringify(profile), 'Profile should equal the reference');
  });
}

function testVerifyToken() {
  var tokenFile = sampleTokenFiles.ryan_apr20,
      token = tokenFile[0].token;

  var publicKey = "02413d7c51118104cfe1b41e540b6c2acaaf91f1e2e22316df7448fb6070d582ec",
      compressedAddress = "1BTku19roxQs2d54kbYKVTv21oBCuHEApF",
      uncompressedAddress = "12wes6TQpDF2j8zqvAbXV9KNCGQVF2y7G5";

  (0, _tape2.default)('verifyToken', function (t) {
    t.plan(3);

    var decodedToken1 = (0, _index.verifyToken)(token, publicKey);
    t.ok(decodedToken1, 'Token should have been verified against a public key');

    var decodedToken2 = (0, _index.verifyToken)(token, compressedAddress);
    t.ok(decodedToken2, 'Token should have been verified against a compressed address');

    var decodedToken3 = (0, _index.verifyToken)(token, uncompressedAddress);
    t.ok(decodedToken3, 'Token should have been verified against an uncompressed address');
  });
}

function testZoneFile() {
  (0, _tape2.default)('makeZoneFileForHostedProfile', function (t) {
    t.plan(1);

    var fileUrl = 'https://mq9.s3.amazonaws.com/naval.id/profile.json';
    var zoneFile = (0, _index.makeZoneFileForHostedProfile)('naval.id', fileUrl);
    //console.log(zoneFile)
    t.ok(zoneFile, 'Zone file should have been created for hosted profile');
  });
}

function testSchemas() {
  (0, _tape2.default)('Profile', function (t) {
    t.plan(5);

    var profileObject = new _index.Profile(sampleProfiles.naval);
    t.ok(profileObject, 'Profile object should have been created');

    var validationResults = _index.Profile.validateSchema(sampleProfiles.naval);
    t.ok(validationResults.valid, 'Profile should be valid');

    var profileJson = profileObject.toJSON();
    t.ok(profileJson, 'Profile JSON should have been created');

    var tokenRecords = profileObject.toSignedTokens(privateKeychain);
    t.ok(tokenRecords, 'Profile tokens should have been created');

    var profileObject2 = _index.Profile.fromTokens(tokenRecords, publicKeychain);
    t.ok(profileObject2, 'Profile should have been reconstructed from tokens');
  });

  (0, _tape2.default)('Person', function (t) {
    t.plan(18);

    var personObject = new _index.Person(sampleProfiles.naval);
    t.ok(personObject, 'Person object should have been created');

    var validationResults = _index.Person.validateSchema(sampleProfiles.naval, true);
    t.ok(validationResults.valid, 'Person profile should be valid');

    var standaloneProperties = ['taxID', 'birthDate', 'address'];
    var tokenRecords = personObject.toSignedTokens(privateKeychain, standaloneProperties);
    t.ok(tokenRecords, 'Person profile tokens should have been created');
    _fs2.default.writeFileSync('./docs/tokenfiles/naval-4-tokens.json', JSON.stringify(tokenRecords, null, 2));

    var profileObject2 = _index.Person.fromTokens(tokenRecords, publicKeychain);
    t.ok(profileObject2, 'Person profile should have been reconstructed from tokens');

    var name = personObject.name();
    t.ok(name, 'Name should have been returned');
    t.equal(name, 'Naval Ravikant', 'Name should match the expected value');

    var givenName = personObject.givenName();
    t.ok(givenName, 'Given name should have been returned');
    t.equal(givenName, 'Naval', 'Given name should match the expected value');

    var familyName = personObject.familyName();
    t.ok(familyName, 'Family name should have been returned');
    t.equal(familyName, 'Ravikant', 'Family name should match the expected value');

    var description = personObject.description();
    t.ok(description, 'Avatar URL should have been returned');

    var avatarUrl = personObject.avatarUrl();
    t.ok(avatarUrl, 'Avatar URL should have been returned');

    var verifiedAccounts = personObject.verifiedAccounts([]);
    t.ok(verifiedAccounts, 'Verified accounts should have been returned');
    t.equal(verifiedAccounts.length, 0, 'Verified accounts should match the expected value');

    var address = personObject.address();
    t.ok(address, 'Address should have been returned');

    var birthDate = personObject.birthDate();
    t.ok(birthDate, 'Birth date should have been returned');

    var connections = personObject.connections();
    t.ok(connections, 'Connections should have been returned');

    var organizations = personObject.organizations();
    t.ok(organizations, 'Organizations should have been returned');
  });

  (0, _tape2.default)('legacyFormat', function (t) {
    t.plan(2);

    var profileObject = _index.Person.fromLegacyFormat(sampleProfiles.navalLegacy);
    t.ok(profileObject, 'Profile object should have been created from legacy formatted profile');

    var validationResults = _index.Person.validateSchema(profileObject.toJSON(), true);
    t.ok(validationResults, 'Profile should be in a valid format');
  });
}

testVerifyToken();
testTokening('naval.json', sampleProfiles.naval);
testTokening('google.json', sampleProfiles.google);
testTokening('balloonDog.json', sampleProfiles.balloonDog);
testZoneFile();
testSchemas();