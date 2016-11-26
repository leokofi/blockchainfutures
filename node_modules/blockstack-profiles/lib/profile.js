'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Profile = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tokenSigning = require('./tokenSigning');

var _tokenVerifying = require('./tokenVerifying');

var _schemaInspector = require('schema-inspector');

var _schemaInspector2 = _interopRequireDefault(_schemaInspector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var schemaDefinition = {
  type: 'object',
  properties: {
    '@context': { type: 'string', optional: true },
    '@type': { type: 'string' }
  }
};

var Profile = exports.Profile = function () {
  function Profile() {
    var profile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Profile);

    this._profile = Object.assign({}, {
      '@context': 'http://schema.org/'
    }, profile);
  }

  _createClass(Profile, [{
    key: 'toJSON',
    value: function toJSON() {
      return Object.assign({}, this._profile);
    }
  }, {
    key: 'toSignedTokens',
    value: function toSignedTokens(privateKeychain) {
      var standaloneProperties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      var profileComponents = [],
          profile = this.toJSON();
      standaloneProperties.map(function (property) {
        if (profile.hasOwnProperty(property)) {
          var subprofile = _defineProperty({}, property, profile[property]);
          profileComponents.push(subprofile);
          delete profile[property];
        }
      });
      profileComponents = [profile].concat(_toConsumableArray(profileComponents));
      return (0, _tokenSigning.signTokenRecords)(profileComponents, privateKeychain);
    }
  }], [{
    key: 'validateSchema',
    value: function validateSchema(profile) {
      return _schemaInspector2.default.validate(schemaDefinition, profile);
    }
  }, {
    key: 'fromTokens',
    value: function fromTokens(tokenRecords, publicKeychain) {
      var profile = (0, _tokenVerifying.getProfileFromTokens)(tokenRecords, publicKeychain);
      return new Profile(profile);
    }
  }]);

  return Profile;
}();