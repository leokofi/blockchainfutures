'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signToken = signToken;
exports.wrapToken = wrapToken;
exports.signTokenRecords = signTokenRecords;

var _blockstackKeychains = require('blockstack-keychains');

var _bitcoinjsLib = require('bitcoinjs-lib');

var _jwtJs = require('jwt-js');

var _bigi = require('bigi');

var _bigi2 = _interopRequireDefault(_bigi);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function signToken(claim, signingPrivateKey, subject) {
  var issuer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var signingAlgorithm = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'ES256K';
  var issuedAt = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new Date();
  var expiresAt = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : (0, _utils.nextYear)();


  if (signingAlgorithm !== 'ES256K') {
    throw new Error('Signing algorithm not supported');
  }

  var privateKeyBigInteger = _bigi2.default.fromBuffer(new Buffer(signingPrivateKey, 'hex')),
      ellipticKeyPair = new _bitcoinjsLib.ECPair(privateKeyBigInteger, null, {}),
      issuerPublicKey = ellipticKeyPair.getPublicKeyBuffer().toString('hex');

  if (issuer === null) {
    issuer = {
      publicKey: issuerPublicKey
    };
  }

  var payload = {
    claim: claim,
    subject: subject,
    issuer: issuer,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  var tokenSigner = new _jwtJs.TokenSigner(signingAlgorithm, signingPrivateKey),
      token = tokenSigner.sign(payload);

  return token;
}

function wrapToken(token) {
  return {
    token: token,
    decodedToken: (0, _jwtJs.decodeToken)(token),
    encrypted: false
  };
}

function signTokenRecords(profileComponents, privateKeychain) {
  var signingAlgorithm = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'ES256K';


  if (!privateKeychain instanceof _blockstackKeychains.PrivateKeychain) {
    throw new Error('Invalid private keychain');
  }

  if (signingAlgorithm !== 'ES256K') {
    throw new Error('Signing algorithm not supported');
  }

  var tokenRecords = [],
      parentPublicKey = privateKeychain.publicKeychain().publicKey('hex');

  profileComponents.map(function (data) {
    var derivationEntropy = _bitcoinjsLib.crypto.sha256(Buffer.concat([privateKeychain.privateKey(), new Buffer(JSON.stringify(data))]));

    var privateChildKeychain = privateKeychain.child(derivationEntropy),
        privateKey = privateChildKeychain.privateKey('hex'),
        publicKey = privateChildKeychain.publicKeychain().publicKey('hex');

    var subject = { publicKey: publicKey };
    var token = signToken(data, privateKey, subject, null, signingAlgorithm),
        tokenRecord = wrapToken(token);
    tokenRecord.parentPublicKey = parentPublicKey;
    tokenRecord.derivationEntropy = derivationEntropy.toString('hex');

    tokenRecords.push(tokenRecord);
  });

  return tokenRecords;
}