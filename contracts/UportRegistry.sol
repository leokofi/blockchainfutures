pragma solidity ^0.4.3;
contract UportRegistry {
  event AttributesSet(address indexed _sender, uint _timestamp);
  uint public version;
  address public owner;

  mapping(address => bytes) public ipfsAttributeLookup;

  function UportRegistry() {
    version = 1;
  }


  function setAttributes(address personaAddress, bytes ipfsHash) {
    ipfsAttributeLookup[personaAddress] = ipfsHash;
    AttributesSet(personaAddress, now);
  }

  function getAttributes(address personaAddress) constant returns(bytes) {
    return ipfsAttributeLookup[personaAddress];
  }
}
