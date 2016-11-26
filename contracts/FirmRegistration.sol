pragma solidity ^0.4.2;
// http://www.osc.gov.on.ca/en/Dealers_who-needs-register_index.htm

// The default owned contract
contract owned{
  function owned() {
    owner = msg.sender;
  }

  function newowner(address addr) onlyowner {
    owner = addr;
  }

  modifier onlyowner() {
    if(msg.sender==owner) 
    _;

  }

  address public owner;
}

// contract for broker registeration
contract FirmRegistration is owned {

mapping (address => FirmRegister) name;

struct FirmRegister {
  string name;
  uint telephone;
  address pubAddress;
  string category;
  string category2;
  
}

struct FirmStatus {
  bool suppended;
  bool approved;
}

// event logs
event logReisterFirm(address addr );

function registerFirm(address addr) onlyowner (bool) {
  
}

}