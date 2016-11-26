# Browser friendly ipfs.js light

This is meant to implement the most common use cases for using ipfs in a browser. It has zero dependencies.

It meant to be mostly compatible with [ipfs.js](https://github.com/consensys/ipfs.js) with a few key differences:

- no specific support for Buffers. Buffer's still work, see caveat below in documentation for ipfs.cat
- only implements simple add and cat functionality
- Basically if you're using ipfs as a simple KV store, this should do the trick

Run `npm install browser-ipfs`

Or reference `dist/ipfs.min.js` inside a `<script />` to expose the global `ipfs`

## Example

### 1) Set IPFS CORS access

       ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
       ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
       ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'

### 2) Start IPFS

       ipfs daemon

### 3) Upload example directory

`git clone https://github.com/ConsenSys/ipfs.js && cd ipfs.js`

For non-default ipfs configurations, you can run `./example.url` to `ipfs add -r example` and print the local gateway's url

### 4) Open IPFS gateway

Navigate to the url echoed from `./example.url` in the browser, or run `./example.url | xargs open` to open it on OSX

## Methods

#### `ipfs.setProvider({host: 'localhost', port: '5001'})`

* _localhost_ and _5001_ are the defaults when calling without arguments
* is also equivalent to `ipfs.setProvider({host: '/ip4/127.0.0.1/tcp/5001'})`

### `ipfs.setProvider(require('ipfs-api')('localhost', '5001'))`

#### `ipfs.add(stringOrBuffer, callback)`

	ipfs.add("Testing...", function(err, hash) {
		if (err) throw err; // If connection is closed
		console.log(hash); 	// "Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt"
	});

#### `ipfs.cat(hash, callback)`

Since we want to avoid including Buffer as a specific dependency. You need to manually convert the data returned from cat to a Buffer if that is what you're expecting.

  ipfs.cat("Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt", function(err, data) {
    if (err) throw err;
    console.log(new Buffer(data,'binary').toString());   // "Testing..."
  });

#### `ipfs.catText(hash, callback)`

	ipfs.cat("Qmc7CrwGJvRyCYZZU64aPawPj7CJ56vyBxdhxa38Dh1aKt", function(err, text) {
		if (err) throw err;
		console.log(text); 	// "Testing..."
	});

  new buffer.Buffer(data, 'binary')

#### `ipfs.addJson(json, callback)`

#### `ipfs.catJson(hash, callback)`