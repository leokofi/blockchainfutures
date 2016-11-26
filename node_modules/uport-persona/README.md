# uPort Persona
A library for creating, updating and reading attributes and claims on uport personas. It's intended as an easy interface to the uport-registry, allowing developers to focus on the actual data instead of the datastructure of the object stored in the registry. It contains two main classes `Persona` for getting information on a persona, and `MutablePersona` which is a subclass of `Persona` with additional features for updating persona information.
## Example usage
### Importing
```js
import { Persona, MutablePersona } from 'uport-persona';
```

### Basic information viewing
For each persona you want to interact with you have to create a separate instance of the Persona class.
```js
// the address of the persona you want to interact with
let myAddress = "0x123...";
let ipfsProvider = {
  host: 'localhost',
  port: '5001',
  protocol: 'https',
  root: ''
}
let persona = new Persona(myAddress, ipfs, web3.currentProvider);
persona.load().then(() => { ... });
```

Once instantiated you can start by getting the current profile:
```js
let profile = persona.getProfile();
```
The `profile` is in JSON format containing all attributes associated with the persona.

### Viewing attestations
An attestation, also called a claim is the basic building block of the information associated with a persona. By default all attributes are self signed claims created by the persona that it's associated with. But an attribute can have multiple claims, meaning that several parties have signed it. The claims are in the same format as [blockstack-profiles](https://github.com/blockstack/blockstack-profiles-js).
To get all claims associated with the persona:
```js
let claims = persona.getAllClaims();
```

You can also get all claims to a specific attribute:
```js
let claims = persona.getClaims("MyAttribute");
```

### Signing attributes as a third party
As a third party you would like to attest to the fact that the given persona has a specific attribute. By signing an attribute you create a claim.
```js
let thirdPartyPrivKey = ...
let thirdPartyAddress = "0x...";
let claim = persona.signAttribute("MyAttribute", thirdPartyPrivKey, thirdPartyAddress);
```

### Modifying a persona
To modify a persona the `MutablePersona` class needs to be used. It's instantiated in the same way as the `Persona` class. An important thing to note is that `MutablePersona` will make changes locally and only write the changes to the blockchain if the method `writeToRegistry` is called.
```js
// the address of the persona you want to interact with
let myAddress = "0x123...";
let ipfs = ipfsApi(<hostname>, <port>);
let persona = new MutablePersona(myAddress, ipfs, web3.currentProvider);
persona.load().then(() => { ... });
```

#### Creating a profile.
Note that the first thing that needs to be added to a profile is the public signing key. If this is not done the `addAttribute` method will throw an error.
```js
let myPrivSignKey = ...
persona.setPublicSigningKey(myPrivSignKey)
persona.addAttribute({ attributeName: attributeValue }, privKey);
```

#### Adding a claim.
```js
persona.addClaim(claim)
```

#### Write the changes to the blockchain.
While making changes to the persona these changes are only stored in the javascript object. To save the changes to the blockchain the following function needs to be called.
```js
persona.writeToRegistry().then((txHash) => { ... });
```

## Running tests
Simply run
```
$ npm test
```
## Documentation
<a name="Persona"></a>

## Persona
Class representing a persona.

**Kind**: global class  

* [Persona](#Persona)
    * _instance_
        * [.constructor(address, ipfsProvider, web3Provider, [registryAddress])](#Persona+constructor) ⇒ <code>Object</code>
        * [.loadAttributes()](#Persona+loadAttributes) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
        * [.load(claims)](#Persona+load) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
        * [.getProfile()](#Persona+getProfile) ⇒ <code>JSON</code>
        * [.getPublicSigningKey()](#Persona+getPublicSigningKey) ⇒ <code>String</code>
        * [.getPublicEncryptionKey()](#Persona+getPublicEncryptionKey) ⇒ <code>String</code>
        * [.getAllClaims()](#Persona+getAllClaims) ⇒ <code>JSON</code>
        * [.getClaims(attributesName)](#Persona+getClaims) ⇒ <code>JSON</code>
        * [.signAttribute(attribute, privSignKey, issuerId)](#Persona+signAttribute) ⇒ <code>Object</code>
        * [.signMultipleAttributes(attribute, privSignKey, issuerId)](#Persona+signMultipleAttributes) ⇒ <code>Array</code>
    * _static_
        * [.isTokenValid(token)](#Persona.isTokenValid) ⇒ <code>Boolean</code>
        * [.privateKeyToPublicKey(privateKey)](#Persona.privateKeyToPublicKey) ⇒ <code>String</code>

<a name="Persona+constructor"></a>

### persona.constructor(address, ipfsProvider, web3Provider, [registryAddress]) ⇒ <code>Object</code>
Class constructor.
 Creates a new persona object. The registryAddress is an optional argument and if not specified will be set to the default consensys testnet uport-registry.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Object</code> - self  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| address | <code>String</code> |  | the address of the persona |
| ipfsProvider | <code>String</code> |  | an ipfs provider |
| web3Provider | <code>String</code> |  | web3 provider |
| [registryAddress] | <code>String</code> | <code>&#x27;0xa9be82e93628abaac5ab557a9b3b02f711c0151c&#x27;</code> | the uport-registry address to use. |

<a name="Persona+loadAttributes"></a>

### persona.loadAttributes() ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
This should be the only function used to get attributes from the uport-registry. This can be overridden in
 a subclass.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Promise.&lt;JSON, Error&gt;</code> - A promise that returns all claims registered to the persona. Encrypted claims would be included here. Or an Error if rejected.  
<a name="Persona+load"></a>

### persona.load(claims) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
This function always have to be called before interacting with the persona. This function loads the profile of the persona from the uport-registry into the persona object. The only time this function should not be called is when creating a completely new persona.
 If the Claims argument is given these claims are used instead of loading anything from the uport-registry.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Promise.&lt;JSON, Error&gt;</code> - A promise that returns all claims registered to the persona. Encrypted claims would be included here. Or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| claims | <code>Object</code> | A list of claims. If argument is not given the persona will load from the registry. |

<a name="Persona+getProfile"></a>

### persona.getProfile() ⇒ <code>JSON</code>
This function returns the profile of the persona in JSON format.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
**Returns**: <code>JSON</code> - profile  
<a name="Persona+getPublicSigningKey"></a>

### persona.getPublicSigningKey() ⇒ <code>String</code>
Returns the public signing key of the persona.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
<a name="Persona+getPublicEncryptionKey"></a>

### persona.getPublicEncryptionKey() ⇒ <code>String</code>
Returns the public encryption key of the persona, if set.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
<a name="Persona+getAllClaims"></a>

### persona.getAllClaims() ⇒ <code>JSON</code>
Returns all claims associated with the persona.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
**Returns**: <code>JSON</code> - List of claims  
<a name="Persona+getClaims"></a>

### persona.getClaims(attributesName) ⇒ <code>JSON</code>
Returns all claims that have the given attribute name.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
**Returns**: <code>JSON</code> - List of claims  

| Param | Type | Description |
| --- | --- | --- |
| attributesName | <code>String</code> | the name of the attribute to check |

<a name="Persona+signAttribute"></a>

### persona.signAttribute(attribute, privSignKey, issuerId) ⇒ <code>Object</code>
Signs the given attribute to the persona. This method is to be used by third parties who wishes to attest to an attribute of the persona. Note that this does not add anything to the persona, it only returns a signed claim. To add a claim to a persona the addClaim method of MutablePersona has to be used.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Object</code> - claim  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |
| privSignKey | <code>String</code> | the private signing key of the attestor |
| issuerId | <code>String</code> | the address of the attestor (voluntary, to allow finding info on the attestor from uport-registry) |

<a name="Persona+signMultipleAttributes"></a>

### persona.signMultipleAttributes(attribute, privSignKey, issuerId) ⇒ <code>Array</code>
Same as signAttribute but for a list of attributes.

**Kind**: instance method of <code>[Persona](#Persona)</code>  
**Returns**: <code>Array</code> - List of claims  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Array</code> | the attribute to add, in the format [{attrName: attr},...] |
| privSignKey | <code>String</code> | the private signing key of the attestor |
| issuerId | <code>String</code> | the ethereum address of the attestor |

<a name="Persona.isTokenValid"></a>

### Persona.isTokenValid(token) ⇒ <code>Boolean</code>
A static function for checking if a token is valid.

**Kind**: static method of <code>[Persona](#Persona)</code>  

| Param | Type |
| --- | --- |
| token | <code>Object</code> | 

<a name="Persona.privateKeyToPublicKey"></a>

### Persona.privateKeyToPublicKey(privateKey) ⇒ <code>String</code>
A static function for checking if a token is valid.

**Kind**: static method of <code>[Persona](#Persona)</code>  
**Returns**: <code>String</code> - publicKey  

| Param | Type |
| --- | --- |
| privateKey | <code>String</code> | 



<a name="MutablePersona"></a>

## MutablePersona ⇐ <code>[Persona](#Persona)</code>
Class representing a persona that can be modified.

**Kind**: global class  
**Extends:** <code>[Persona](#Persona)</code>  

* [MutablePersona](#MutablePersona) ⇐ <code>[Persona](#Persona)</code>
    * [.writeToRegistry()](#MutablePersona+writeToRegistry) ⇒ <code>Promise.&lt;String, Error&gt;</code>
    * [.addClaim(claim)](#MutablePersona+addClaim)
    * [.addClaims(claimList)](#MutablePersona+addClaims)
    * [.removeClaim(claim)](#MutablePersona+removeClaim)
    * [.addAttribute(attribute, privSignKey)](#MutablePersona+addAttribute)
    * [.replaceAttribute(attribute, privSignKey)](#MutablePersona+replaceAttribute)
    * [.removeAttribute(attribute)](#MutablePersona+removeAttribute)
    * [.setPublicSigningKey(privSignKey)](#MutablePersona+setPublicSigningKey)
    * [.setPublicencryptionKey(pubEncKey, privSignKey)](#MutablePersona+setPublicencryptionKey)
    * [.constructor(address, ipfsProvider, web3Provider, [registryAddress])](#Persona+constructor) ⇒ <code>Object</code>
    * [.loadAttributes()](#Persona+loadAttributes) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
    * [.load(claims)](#Persona+load) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
    * [.getProfile()](#Persona+getProfile) ⇒ <code>JSON</code>
    * [.getPublicSigningKey()](#Persona+getPublicSigningKey) ⇒ <code>String</code>
    * [.getPublicEncryptionKey()](#Persona+getPublicEncryptionKey) ⇒ <code>String</code>
    * [.getAllClaims()](#Persona+getAllClaims) ⇒ <code>JSON</code>
    * [.getClaims(attributesName)](#Persona+getClaims) ⇒ <code>JSON</code>
    * [.signAttribute(attribute, privSignKey, issuerId)](#Persona+signAttribute) ⇒ <code>Object</code>
    * [.signMultipleAttributes(attribute, privSignKey, issuerId)](#Persona+signMultipleAttributes) ⇒ <code>Array</code>

<a name="MutablePersona+writeToRegistry"></a>

### mutablePersona.writeToRegistry() ⇒ <code>Promise.&lt;String, Error&gt;</code>
This should be the only function ever used to write the persona onto the blockchain. This can be overridden in
 a subclass.

 It stores whatever is in this.tokenRecords.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>Promise.&lt;String, Error&gt;</code> - A promise that returns the txHash of the transaction updating the registry. Or an Error if rejected.  
<a name="MutablePersona+addClaim"></a>

### mutablePersona.addClaim(claim)
Add a signed claim to this persona. This should be used to add tokens signed by third parties.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  

| Param | Type | Description |
| --- | --- | --- |
| claim | <code>JSON</code> | the claim to add |

<a name="MutablePersona+addClaims"></a>

### mutablePersona.addClaims(claimList)
Add mulitple signed claims to this persona. This should be used to add tokens signed by third parties.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  

| Param | Type | Description |
| --- | --- | --- |
| claimList | <code>JSON</code> | the claims to add |

<a name="MutablePersona+removeClaim"></a>

### mutablePersona.removeClaim(claim)
Removes a signed claim from a persona.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  

| Param | Type | Description |
| --- | --- | --- |
| claim | <code>JSON</code> | the claim to remove |

<a name="MutablePersona+addAttribute"></a>

### mutablePersona.addAttribute(attribute, privSignKey)
Adds a self signed attribute to the persona. Only to be used if you own the privSignKey of this persona.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |
| privSignKey | <code>String</code> | the private signing key of the persona |

<a name="MutablePersona+replaceAttribute"></a>

### mutablePersona.replaceAttribute(attribute, privSignKey)
Removes all tokens having the same attribute name as the given attribute and adds the given attribute.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |
| privSignKey | <code>String</code> | the private signing key of the persona |

<a name="MutablePersona+removeAttribute"></a>

### mutablePersona.removeAttribute(attribute)
Removes all attributes with the same attribute name as the given attribute.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |

<a name="MutablePersona+setPublicSigningKey"></a>

### mutablePersona.setPublicSigningKey(privSignKey)
Sets the public signing key of the persona.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  

| Param | Type | Description |
| --- | --- | --- |
| privSignKey | <code>String</code> | the private signing key of the persona |

<a name="MutablePersona+setPublicencryptionKey"></a>

### mutablePersona.setPublicencryptionKey(pubEncKey, privSignKey)
Sets the public encryption key of the persona.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  

| Param | Type | Description |
| --- | --- | --- |
| pubEncKey | <code>String</code> | the public encryption key of the persona |
| privSignKey | <code>String</code> | the private signing key of the persona |

<a name="Persona+constructor"></a>

### mutablePersona.constructor(address, ipfsProvider, web3Provider, [registryAddress]) ⇒ <code>Object</code>
Class constructor.
 Creates a new persona object. The registryAddress is an optional argument and if not specified will be set to the default consensys testnet uport-registry.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>Object</code> - self  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| address | <code>String</code> |  | the address of the persona |
| ipfsProvider | <code>String</code> |  | an ipfs provider |
| web3Provider | <code>String</code> |  | web3 provider |
| [registryAddress] | <code>String</code> | <code>&#x27;0xa9be82e93628abaac5ab557a9b3b02f711c0151c&#x27;</code> | the uport-registry address to use. |

<a name="Persona+loadAttributes"></a>

### mutablePersona.loadAttributes() ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
This should be the only function used to get attributes from the uport-registry. This can be overridden in
 a subclass.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>Promise.&lt;JSON, Error&gt;</code> - A promise that returns all claims registered to the persona. Encrypted claims would be included here. Or an Error if rejected.  
<a name="Persona+load"></a>

### mutablePersona.load(claims) ⇒ <code>Promise.&lt;JSON, Error&gt;</code>
This function always have to be called before interacting with the persona. This function loads the profile of the persona from the uport-registry into the persona object. The only time this function should not be called is when creating a completely new persona.
 If the Claims argument is given these claims are used instead of loading anything from the uport-registry.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>Promise.&lt;JSON, Error&gt;</code> - A promise that returns all claims registered to the persona. Encrypted claims would be included here. Or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| claims | <code>Object</code> | A list of claims. If argument is not given the persona will load from the registry. |

<a name="Persona+getProfile"></a>

### mutablePersona.getProfile() ⇒ <code>JSON</code>
This function returns the profile of the persona in JSON format.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>JSON</code> - profile  
<a name="Persona+getPublicSigningKey"></a>

### mutablePersona.getPublicSigningKey() ⇒ <code>String</code>
Returns the public signing key of the persona.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
<a name="Persona+getPublicEncryptionKey"></a>

### mutablePersona.getPublicEncryptionKey() ⇒ <code>String</code>
Returns the public encryption key of the persona, if set.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
<a name="Persona+getAllClaims"></a>

### mutablePersona.getAllClaims() ⇒ <code>JSON</code>
Returns all claims associated with the persona.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>JSON</code> - List of claims  
<a name="Persona+getClaims"></a>

### mutablePersona.getClaims(attributesName) ⇒ <code>JSON</code>
Returns all claims that have the given attribute name.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>JSON</code> - List of claims  

| Param | Type | Description |
| --- | --- | --- |
| attributesName | <code>String</code> | the name of the attribute to check |

<a name="Persona+signAttribute"></a>

### mutablePersona.signAttribute(attribute, privSignKey, issuerId) ⇒ <code>Object</code>
Signs the given attribute to the persona. This method is to be used by third parties who wishes to attest to an attribute of the persona. Note that this does not add anything to the persona, it only returns a signed claim. To add a claim to a persona the addClaim method of MutablePersona has to be used.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>Object</code> - claim  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Object</code> | the attribute to add, in the format {attrName: attr} |
| privSignKey | <code>String</code> | the private signing key of the attestor |
| issuerId | <code>String</code> | the address of the attestor (voluntary, to allow finding info on the attestor from uport-registry) |

<a name="Persona+signMultipleAttributes"></a>

### mutablePersona.signMultipleAttributes(attribute, privSignKey, issuerId) ⇒ <code>Array</code>
Same as signAttribute but for a list of attributes.

**Kind**: instance method of <code>[MutablePersona](#MutablePersona)</code>  
**Returns**: <code>Array</code> - List of claims  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>Array</code> | the attribute to add, in the format [{attrName: attr},...] |
| privSignKey | <code>String</code> | the private signing key of the attestor |
| issuerId | <code>String</code> | the ethereum address of the attestor |


