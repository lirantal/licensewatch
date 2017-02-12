'use strict'

const glob = require('glob')
const fs = require('fs')
const Promise = require('bluebird')

/**
 * Constructor function for the LicensesCheck module
 *
 * @param {string} filesPattern glob syntax for matching package.json files, for example: node_modules/ ** /package.json
 * @constructor
 */
function LicenseCheck(filesPattern = 'node_modules/**/package.json') {
  this.filesPattern = filesPattern
}

/**
 * Returns a list of all matched files based on glob pattern passed to the LicenseCheck constructor
 * @returns {Promise} globPromise resolved with an array of file paths
 */
LicenseCheck.prototype.listFiles = function () {

  if (typeof this.filesPattern !== 'string') {
    return false
  }

  if (this.filesPattern.length === 0) {
    return false
  }

  const globPromise = Promise.promisify(glob)
  return globPromise(this.filesPattern)
}

/**
 * A reducer which essentially creates a hashmap object of licenses aggregated
 * based on the count of their appearance in a licenses array
 *
 * @param {array} licenses string array of license names
 * @returns {Object} normalizedLicenses
 */
LicenseCheck.prototype.normalize = function (licenses = []) {
  if (Array.isArray(licenses) !== true) {
    return false
  }

  let normalizedLicenses = licenses.reduce((licenseHash, nextLicense) => {

    let licenseCounter = licenseHash[nextLicense]
    if (!!licenseCounter) {
      licenseHash[nextLicense] += 1
    } else {
      licenseHash[nextLicense] = 1
    }

    return licenseHash

  }, {})

  return normalizedLicenses
}

/**
 * Asynchronously read contents of all package.json files from array of files
 * and parse the license information from files
 *
 * @param {array} files
 * @return {Promise} licensePromises resolved to an array of licenses
 */
LicenseCheck.prototype.licenses = function (files = []) {

  let licensePromises = []

  files.forEach((item) => {

    let filePromise = new Promise((resolve, reject) => {

      fs.readFile(item, {encoding: 'utf-8'}, (error, data) => {

        if (error) {
          return reject(error)
        }

        let packageFile = JSON.parse(data)
        let packageLicense = packageFile.license

        if (!!packageLicense === false) {
          packageLicense = 'undefined'
        }

        if (typeof packageLicense === 'object') {
          packageLicense = packageLicense.type
        }

        return resolve(packageLicense)

      })

    })

    licensePromises.push(filePromise)

  })

  return new Promise((resolve, reject) => {
    Promise.all(licensePromises)
      .then((values) => {
        return resolve(values)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

module.exports = LicenseCheck
