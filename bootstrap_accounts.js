var accounts = require('./lib/Accounts');
var ipfs = require('ipfs');
var test_accounts = require('./test_accounts.json');
var registryAddress = require('./build/contracts/UportRegistry.sol').deployed().address
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var async = require('async');
var _ = require('underscore');
var ip = new ipfs('localhost', '5001', {
    protocol: 'http'
});


var uport = require('./vendor/uport-persona');
var osc = test_accounts.osc;
accounts.createNewAccount(osc, function(err, address, pubKey, pwDerivedKey, ks) {
	var persona = new uport.MutablePersona(address, ip, web3.currentProvider, registryAddress);
	var privateKey = ks.exportPrivateKey(address, pwDerivedKey);
	persona.setPublicSigningKey(privateKey);
	persona.addAttribute({
		encryption_key : pubKey
	}, privateKey);
    persona.writeToRegistry(address).then(function testPersona() {
        var _p = new uport.Persona(address, ip, web3.currentProvider, registryAddress);
        _p.load().then(function(e) {
            console.log("primis", e);
        });
    });
});
