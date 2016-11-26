pragma solidity ^0.4.4;

contract owned {
    address public owner;

    function owned() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _;
    }

    function transferOwnership(address newOwner) onlyOwner {
        owner = newOwner;
    }
}

contract token is owned {
	uint tokenCounter;
	mapping (uint => tokenStruct) tokenBalance;

	event Minted (address minterID, uint amount, bool registered);
	event Transferred (address sender, address receiver, uint amount, uint tokenID);
	event Activate (address sender, uint TokenID, bool active);

	struct tokenStruct {
		uint initialSupply;
		address issuer;
		Type coinType;
		mapping (address => uint) accountBalance;
		mapping (address => bool) accountActive;
	}

	enum Type { Scam, Equity, Debt }

	modifier onlyActive (uint _tokenID, address _caller){
		if (tokenBalance[_tokenID].accountActive[_caller] == true) _;
	}

	modifier checkAmount (uint _tokenID, uint _amount, address _caller){
		if (tokenBalance[_tokenID].accountBalance[_caller] >= _amount && _amount > 0) _;
	}

	function token () {
		tokenCounter = 0;
	}

	function mintToken (uint _amount, uint _type) {
		tokenCounter += 1;
		if (_type == 1) {
			tokenBalance[tokenCounter].coinType = Type.Equity;
		} else if (_type == 2) {
			tokenBalance[tokenCounter].coinType = Type.Debt;
		} else throw;
		tokenBalance[tokenCounter].issuer = msg.sender;
		tokenBalance[tokenCounter].initialSupply = _amount;
		tokenBalance[tokenCounter].accountBalance[msg.sender] = _amount;
		accEnable(tokenCounter, msg.sender, true);
		Minted (msg.sender, _amount, true);
	}

	function transfer (uint _tokenID, uint _amount, address _sender, address _receiver) onlyActive (_tokenID, _sender) checkAmount (_tokenID, _amount, _sender) {
		if (tokenBalance[_tokenID].accountActive[_receiver] == false) accEnable (_tokenID, _receiver, true);
		tokenBalance[_tokenID].accountBalance[_sender] -= _amount;
		tokenBalance[_tokenID].accountBalance[_receiver] += _amount;
		Transferred (_sender, _receiver, _amount, _tokenID);
	}

	function balanceOf (uint _tokenID, address _sender) constant returns (Type, uint, bool) {
		return (tokenBalance[_tokenID].coinType, tokenBalance[_tokenID].accountBalance[_sender], tokenBalance[_tokenID].accountActive[_sender]);
	}

	function tradeToken (uint sender_tokenID, uint sender_amount, address _sender, uint receiver_tokenID, uint receiver_amount, address _receiver) onlyActive (sender_tokenID, _sender) onlyActive (receiver_tokenID, _receiver){
		transfer (sender_tokenID, sender_amount, _sender, _receiver);
		transfer (receiver_tokenID, receiver_amount, _receiver, _sender);
	}

	function accEnable (uint _tokenID, address _sender, bool enable) {
		tokenBalance[_tokenID].accountActive[_sender] = enable;
		Activate (_sender, _tokenID, enable);
	}
}
