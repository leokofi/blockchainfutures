'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeZoneFileForHostedProfile = makeZoneFileForHostedProfile;

var _blockstackZones = require('blockstack-zones');

function makeZoneFileForHostedProfile(origin, tokenFileUrl) {
  if (tokenFileUrl.indexOf('://') < 0) {
    throw new Error('Invalid token file url');
  }

  var urlParts = tokenFileUrl.split('://')[1].split('/'),
      domain = urlParts[0],
      pathname = '/' + urlParts.slice(1).join('/');

  var zoneFile = {
    "$origin": origin,
    "$ttl": 3600,
    "uri": [{
      "name": "_http._tcp",
      "priority": 10,
      "weight": 1,
      "target": '' + domain + pathname
    }]
  };

  var zoneFileTemplate = '{$origin}\n\
{$ttl}\n\
{uri}\n\
';

  return (0, _blockstackZones.makeZoneFile)(zoneFile, zoneFileTemplate);
}