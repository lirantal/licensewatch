'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require("babel-polyfill");

var EventEmitter = require('events');
var fs = require('fs');
var glob = require('glob');
var Promise = require('bluebird');

/**
 * LicensesFetch class
 *
 * @param {string} filesPattern glob syntax for matching package.json files, for example: node_modules/ ** /package.json
 * @constructor
 */

var LicenseWatch = function (_EventEmitter) {
  _inherits(LicenseWatch, _EventEmitter);

  /**
   *
   * @param {string} filesPattern provide glob path pattern for accessing package.json files
   */
  function LicenseWatch() {
    var filesPattern = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'node_modules/**/package.json';

    _classCallCheck(this, LicenseWatch);

    var _this = _possibleConstructorReturn(this, (LicenseWatch.__proto__ || Object.getPrototypeOf(LicenseWatch)).call(this));

    _this.filesPattern = filesPattern;
    _this.files = [];
    _this.licenses = [];
    _this.licensesSummary = [];
    return _this;
  }

  /**
   * read node_modules/ directory for package.json files, parse them for the licenses
   * and create a summarized object hash for all licenses and their counts
   *
   * @returns {object} licensesSummary object hashmap for licenses
   */


  _createClass(LicenseWatch, [{
    key: 'fetch',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var globPromise, maxLicense;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.filesPattern) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return', {});

              case 2:

                // promisify the glob module
                globPromise = Promise.promisify(glob);

                // create an array of all file paths which includes a package.json file

                _context.prev = 3;
                _context.next = 6;
                return globPromise(this.filesPattern);

              case 6:
                this.files = _context.sent;
                _context.next = 12;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context['catch'](3);

                this.emit('error', _context.t0);

              case 12:

                this.emit('files', this.files);

                // create an array of all licenses read from all package.json files
                _context.prev = 13;
                _context.next = 16;
                return Promise.all(this.collectLicenses(this.files));

              case 16:
                this.licenses = _context.sent;

                this.emit('licenses', this.licenses);
                _context.next = 23;
                break;

              case 20:
                _context.prev = 20;
                _context.t1 = _context['catch'](13);

                this.emit('error', _context.t1);

              case 23:

                // normalizing the the mutli-entry array of licenses into an aggregated
                // sum per license line from package.json
                this.licensesSummary = this.normalize(this.licenses);
                maxLicense = this.max(this.licensesSummary);

                this.emit('licensesSummary', { licenses: this.licensesSummary, maxLicense });

                return _context.abrupt('return', this.licensesSummary);

              case 27:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[3, 9], [13, 20]]);
      }));

      function fetch() {
        return _ref.apply(this, arguments);
      }

      return fetch;
    }()

    /**
     * Asynchronously read contents of all package.json files from array of files
     * and parse the license information from files
     *
     * @param {array} files
     * @return {Promise} licensePromises resolved to an array of licenses
     */

  }, {
    key: 'collectLicenses',
    value: function collectLicenses() {
      var _this2 = this;

      var licensePromises = [];

      this.files.forEach(function (item) {
        var licensePromise = new Promise(function (resolve, reject) {
          fs.readFile(item, { encoding: 'utf-8' }, function (error, data) {
            if (error) {
              _this2.emit('error', error);
              reject(error);
            }

            var packageFile = JSON.parse(data);
            var packageLicense = packageFile.license;

            if (!!packageLicense === false) {
              packageLicense = 'undefined';
            }

            if (typeof packageLicense === 'object') {
              packageLicense = packageLicense.type;
            }

            _this2.licenses.push(packageLicense);
            _this2.emit('license', packageLicense);
            resolve(packageLicense);
          });
        });

        licensePromises.push(licensePromise);
      });

      return licensePromises;
    }

    /**
     * A reducer which essentially creates a hashmap object of licenses aggregated
     * based on the count of their appearance in a licenses array
     *
     * @param {array} licenses string array of license names
     * @returns {Object} normalizedLicenses
     */

  }, {
    key: 'normalize',
    value: function normalize() {
      var licenses = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (Array.isArray(licenses) !== true) {
        return false;
      }

      var normalizedLicenses = licenses.reduce(function (licenseHash, nextLicense) {
        var licenseCounter = licenseHash[nextLicense];
        if (licenseCounter) {
          licenseHash[nextLicense] += 1;
        } else {
          licenseHash[nextLicense] = 1;
        }

        return licenseHash;
      }, {});

      return normalizedLicenses;
    }
  }, {
    key: 'max',
    value: function max() {
      var licenses = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (typeof licenses !== 'object' || licenses === null) {
        return false;
      }

      var maxLicense = {
        name: '',
        count: 0
      };

      for (var license in licenses) {
        if (maxLicense.count < licenses[license]) {
          maxLicense.name = license;
          maxLicense.count = licenses[license];
        }
      }

      return maxLicense;
    }
  }]);

  return LicenseWatch;
}(EventEmitter);

module.exports = LicenseWatch;