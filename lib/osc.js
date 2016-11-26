var Tx = require('ethereumjs-tx');
var bs58 = require('bs58');
var lightwallet = require('eth-lightwallet');
var utils = require('ethereumjs-util');
var Web3 = require('web3');
var web3 = new Web3();
var EthQuery = require('eth-query');
var accounts = require('./accounts');
var async = require('async');
var _ = require('underscore');
var HookedWeb3Provider = require("hooked-web3-provider");
var uport = require('uport-persona');
var ipfs = window.IpfsApi('localhost', '5001')
var rpcURL = '127.0.0.1';
var keyStore = lightwallet.keystore;
var encryption = lightwallet.encryption;
var registryAddress = require('./../build/contracts/UportRegistry.sol').deployed().address;
console.log(registryAddress);

var Promise = require('bluebird');
var encryptionHDPath = "m/0'/0'/2'";
var test_accounts = require('./../test_accounts');
var osc = test_accounts.osc;
var broker = test_accounts.broker;

function base58ToHex(b58) {
    var hexBuf = new Buffer(bs58.decode(b58));
    return hexBuf.toString('hex');
};

function hexToBase58(hexStr) {
    var buf = new Buffer(hexStr, 'hex');
    return bs58.encode(buf);
};

function createWeb3Provider(rpcURL, keyStoreInstance) {
    var query;
    var provider = new HookedWeb3Provider({
        host: undefined,
        transaction_signer: {
            hasAddress: function(address, callback) {
                callback(null, true);
            },
            signTransaction: function(txParams, callback) {
                async.parallel({
                    gas: function(callback) {
                        query.estimateGas(txParams, callback);
                    },
                    gasPrice: function(callback) {
                        query.gasPrice(callback);
                    }
                }, function(err, result) {

                    txParams.gas = result.gas;
                    txParams.gasPrice = result.gasPrice;
                    keyStoreInstance.signTransaction(txParams, callback);
                });
            }
        }
    });
    query = new EthQuery(provider);
    return provider;
}

function appInit(args, onSuccess, onError) {
    accounts.createNewAccount(args, function(err) {
        if (err) {
            return onError(err);
        }
        var args = _.toArray(arguments);
        args = args.slice(1);
        onSuccess.apply(this, args);
    });
}

function errorlog(e) {
    console.log('error', e);
}




var userDetails = {};

function onReady(address, encryption_key, pwDerivedKey, keyStoreInstance) {
    userDetails = {
        address: address,
        encryption_key: encryption_key,
        pwDerivedKey: pwDerivedKey,
        keyStoreInstance: keyStoreInstance
    };
    debugger;
    var provider = createWeb3Provider(rpcURL, keyStoreInstance);
    web3.setProvider(provider);
    var persona = new uport.MutablePersona(address, ipfs, web3.currentProvider, registryAddress);
	var privateKey = keyStoreInstance.exportPrivateKey(address, pwDerivedKey);
	persona.setPublicSigningKey(privateKey);
	persona.addAttribute({
		encryption_key : encryption_key
	}, privateKey);
    persona.writeToRegistry(address).then(function testPersona() {
        var _p = new uport.Persona(address, ipfs, web3.currentProvider, registryAddress);
        _p.load().then(function(e) {
            console.log("primis", e);
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("Dom Loaded");
    appInit(osc, onReady, errorlog);

});
