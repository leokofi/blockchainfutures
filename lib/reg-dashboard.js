var Web3 = require('web3');
var web3 = new Web3();
var TokenListener = require('./../build/contracts/token.sol');
var token = TokenListener.deployed();
var test_accounts = require('./../test_accounts.json');
var osc = test_accounts.osc.address;
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

document.addEventListener("DOMContentLoaded", function() {
    console.log("Dom Loaded");
    TokenListener.setProvider(web3.currentProvider);
    var Minted = token.Minted({}, {
        fromBlock: "latest"
    });
    Minted.watch(function(error, result){
       var output = result.args;
       var output1 = output.minterID.toString();
       var output2 = output.amount.toString();
       var output3 = output.tokenID.toString(); 
    });

    document.getElementById("tokenEvent").innerHTML = output1 + " " + output2 + " " + " " + output3 
    
});