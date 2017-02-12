'use strict'

const glob = require('glob')
const fs = require('fs')
const Promise = require('bluebird')

function LicenseCheck(filesPattern = 'node_modules/**/package.json') {
  this.filesPattern = filesPattern
}

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

LicenseCheck.prototype.licenses = function (files = []) {

  let licenseHash = {}
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
