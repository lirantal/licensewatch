'use strict'

require("babel-polyfill")

const EventEmitter = require('events')
const fs = require('fs')
const glob = require('glob')
const Promise = require('bluebird')

/**
 * LicensesFetch class
 *
 * @param {string} filesPattern glob syntax for matching package.json files, for example: node_modules/ ** /package.json
 * @constructor
 */
class LicenseWatch extends EventEmitter {

  /**
   *
   * @param {string} filesPattern provide glob path pattern for accessing package.json files
   */
  constructor (filesPattern = 'node_modules/**/package.json') {
    super()

    this.filesPattern = filesPattern
    this.files = []
    this.licenses = []
    this.licensesSummary = []
  }

  /**
   * read node_modules/ directory for package.json files, parse them for the licenses
   * and create a summarized object hash for all licenses and their counts
   *
   * @returns {object} licensesSummary object hashmap for licenses
   */
  async fetch () {
    if (!this.filesPattern) {
      return {}
    }

    // promisify the glob module
    const globPromise = Promise.promisify(glob)

    // create an array of all file paths which includes a package.json file
    try {
      this.files = await globPromise(this.filesPattern)
    } catch (error) {
      this.emit('error', error)
    }

    this.emit('files', this.files)

    // create an array of all licenses read from all package.json files
    try {
      this.licenses = await Promise.all(this.collectLicenses(this.files))
      this.emit('licenses', this.licenses)
    } catch (error) {
      this.emit('error', error)
    }

    // normalizing the the mutli-entry array of licenses into an aggregated
    // sum per license line from package.json
    this.licensesSummary = this.normalize(this.licenses)
    const maxLicense = this.max(this.licensesSummary)
    this.emit('licensesSummary', {licenses: this.licensesSummary, maxLicense})

    return this.licensesSummary
  }

  /**
   * Asynchronously read contents of all package.json files from array of files
   * and parse the license information from files
   *
   * @param {array} files
   * @return {Promise} licensePromises resolved to an array of licenses
   */
  collectLicenses () {
    let licensePromises = []

    this.files.forEach((item) => {
      let licensePromise = new Promise((resolve, reject) => {
        fs.readFile(item, {encoding: 'utf-8'}, (error, data) => {
          if (error) {
            this.emit('error', error)
            reject(error)
          }

          let packageFile = JSON.parse(data)
          let packageLicense = packageFile.license

          if (!!packageLicense === false) {
            packageLicense = 'undefined'
          }

          if (typeof packageLicense === 'object') {
            packageLicense = packageLicense.type
          }

          this.licenses.push(packageLicense)
          this.emit('license', packageLicense)
          resolve(packageLicense)
        })
      })

      licensePromises.push(licensePromise)
    })

    return licensePromises
  }

  /**
   * A reducer which essentially creates a hashmap object of licenses aggregated
   * based on the count of their appearance in a licenses array
   *
   * @param {array} licenses string array of license names
   * @returns {Object} normalizedLicenses
   */
  normalize (licenses = []) {
    if (Array.isArray(licenses) !== true) {
      return false
    }

    let normalizedLicenses = licenses.reduce((licenseHash, nextLicense) => {
      let licenseCounter = licenseHash[nextLicense]
      if (licenseCounter) {
        licenseHash[nextLicense] += 1
      } else {
        licenseHash[nextLicense] = 1
      }

      return licenseHash
    }, {})

    return normalizedLicenses
  }

  max (licenses = {}) {
    if (typeof licenses !== 'object' || licenses === null) {
      return false
    }

    let maxLicense = {
      name: '',
      count: 0
    }

    for (let license in licenses) {
      if (maxLicense.count < licenses[license]) {
        maxLicense.name = license
        maxLicense.count = licenses[license]
      }
    }

    return maxLicense
  }

}

module.exports = LicenseWatch
