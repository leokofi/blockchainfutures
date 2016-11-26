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

  mapping (address => FirmRegister) names;
  mapping (address => FirmStatus) status;
  //mapping ()

  struct FirmRegister {
    string name;
    uint telephone;
    address pubAddress;
    bytes32 physicalAddress;
    string category;
    string category2;
    
  }

  struct FirmStatus {
    bool suppended;
    bool approved;
  }

  struct  DealAddress{
    mapping (address => uint) contractIDs;
    string dealtype;
  }

  // event logs
  event logRegisterFirm(address indexed name, bool status );

  function registerFirm(address addr, string _name, uint _telephone, bytes32 _physicaladdress, string _reg_category, string _reg_category2, bool _approved, bool _stat ) onlyowner returns (bool) {
    names[addr] = FirmRegister({
      name: _name,
      telephone: _telephone,
      pubAddress: addr,
      physicalAddress: _physicaladdress,
      category: _reg_category,
      category2: _reg_category2

    });

    status[addr] = FirmStatus ({
      suppended: _stat,
      approved: _approved
    });


    logRegisterFirm(addr, status[addr].approved );
    
  }

}