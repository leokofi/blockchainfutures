pragma solidity ^0.4.3;
contract UportRegistry {
  event AttributesSet(address indexed _sender, uint _timestamp);

  uint public version;
  address public previousPublishedVersion;
  address public owner;
  modifier onlyOwner {
      if(msg.sender != owner)
        throw;
      _;
  }

  mapping(address => bytes) public ipfsAttributeLookup;

  function UportRegistry(address _previousPublishedVersion) {
    version = 1;
    previousPublishedVersion = _previousPublishedVersion;
    owner = msg.sender;
  }

  function transferOwnership(address newOwner) onlyOwner {
      owner = newOwner;
  }

  function setAttributes(address personaAddress, bytes ipfsHash) onlyOwner {
    ipfsAttributeLookup[personaAddress] = ipfsHash;
    AttributesSet(personaAddress, now);
  }

  function getAttributes(address personaAddress) constant returns(bytes) {
    return ipfsAttributeLookup[personaAddress];
  }
}
