'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyToken = verifyToken;
exports.verifyTokenRecord = verifyTokenRecord;
exports.getProfileFromTokens = getProfileFromTokens;

var _blockstackKeychains = require('blockstack-keychains');

var _jwtJs = require('jwt-js');

var _bigi = require('bigi');

var _bigi2 = _interopRequireDefault(_bigi);

var _ecurve = require('ecurve');

var _ecurve2 = _interopRequireDefault(_ecurve);

var _bitcoinjsLib = require('bitcoinjs-lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var secp256k1 = _ecurve2.default.getCurveByName('secp256k1');

function verifyToken(token, verifyingKeyOrAddress) {
  var decodedToken = (0, _jwtJs.decodeToken)(token),
      payload = decodedToken.payload;

  if (!payload.hasOwnProperty('subject')) {
    throw new Error("Token doesn't have a subject");
  }
  if (!payload.subject.hasOwnProperty('publicKey')) {
    throw new Error("Token doesn't have a subject public key");
  }
  if (!payload.hasOwnProperty('issuer')) {
    throw new Error("Token doesn't have an issuer");
  }
  if (!payload.issuer.hasOwnProperty('publicKey')) {
    throw new Error("Token doesn't have an issuer public key");
  }
  if (!payload.hasOwnProperty('claim')) {
    throw new Error("Token doesn't have a claim");
  }

  var issuerPublicKey = payload.issuer.publicKey,
      publicKeyBuffer = new Buffer(issuerPublicKey, 'hex');

  var Q = _ecurve2.default.Point.decodeFrom(secp256k1, publicKeyBuffer),
      compressedKeyPair = new _bitcoinjsLib.ECPair(null, Q, { compressed: true }),
      compressedAddress = compressedKeyPair.getAddress(),
      uncompressedKeyPair = new _bitcoinjsLib.ECPair(null, Q, { compressed: false }),
      uncompressedAddress = uncompressedKeyPair.getAddress();

  if (verifyingKeyOrAddress === issuerPublicKey) {
    // pass
  } else if (verifyingKeyOrAddress === compressedAddress) {
    // pass
  } else if (verifyingKeyOrAddress === uncompressedAddress) {
    // pass
  } else {
    throw new Error("Token issuer public key does not match the verifying value");
  }

  var tokenVerifier = new _jwtJs.TokenVerifier(decodedToken.header.alg, issuerPublicKey);
  if (!tokenVerifier) {
    throw new Error("Invalid token verifier");
  }

  var tokenVerified = tokenVerifier.verify(token);
  if (!tokenVerified) {
    throw new Error("Token verification failed");
  }

  return decodedToken;
}

function verifyTokenRecord(tokenRecord, publicKeyOrKeychain) {
  if (publicKeyOrKeychain === null) {
    throw new Error('A public key or keychain is required');
  }

  var token = tokenRecord.token;
  var verifyingPublicKey = void 0;

  if (typeof publicKeyOrKeychain === 'string') {
    verifyingPublicKey = publicKeyOrKeychain;
  } else if (publicKeyOrKeychain instanceof _blockstackKeychains.PublicKeychain) {
    var childKeychain = publicKeyOrKeychain.child(new Buffer(tokenRecord.derivationEntropy, 'hex'));
    verifyingPublicKey = childKeychain.publicKey('hex');
  } else {
    throw new Error('A valid public key or PublicKeychain object is required');
  }

  var decodedToken = verifyToken(token, verifyingPublicKey);

  return decodedToken;
}

function getProfileFromTokens(tokenRecords, publicKeychain) {
  var profile = {};

  tokenRecords.map(function (tokenRecord) {
    var token = tokenRecord.token,
        decodedToken = null;

    try {
      decodedToken = verifyTokenRecord(tokenRecord, publicKeychain);
    } catch (e) {
      // pass
    }

    if (decodedToken !== null) {
      profile = Object.assign({}, profile, decodedToken.payload.claim);
    }
  });

  return profile;
}