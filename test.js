'use strict'

const test = require('ava')
const LicenseCheck = require('./index')

test('initializing the constructor with no parameters uses defaults', t => {

  let myLicenses = new LicenseCheck()
  t.is(myLicenses.filesPattern, 'node_modules/**/package.json')
})

test('initializing the constructor with a parameter is set successfully', t => {

  const filesPattern = '/tmp/something/node_modules/**/*.js'
  let myLicenses = new LicenseCheck(filesPattern)
  t.is(myLicenses.filesPattern, filesPattern)
})

test('listing files should return an array of all matched files', async t => {

  let myLicenses = new LicenseCheck()
  const licenseFiles = await myLicenses.listFiles()

  t.true(Array.isArray(licenseFiles))
})

test('listing files fail if the filespattern is not a string', async t => {

  let myLicenses = new LicenseCheck(['a'])
  const licenseFiles = await myLicenses.listFiles()

  t.false(licenseFiles)
})

test('listing files fail if the filespattern is not a string', async t => {

  let myLicenses = new LicenseCheck('')
  const licenseFiles = await myLicenses.listFiles()

  t.false(licenseFiles)
})

test('getting all licenses as a bulk array is successful', async t => {

  let myLicenses = new LicenseCheck()
  const licenses = await myLicenses.listFiles().then((filesList) => myLicenses.licenses(filesList))

  t.true(Array.isArray(licenses))
})

test('getting an aggregated list of licenses as a hashmap object', async t => {
  t.plan(2)

  let myLicenses = new LicenseCheck()
  const aggregatedLicenses = await myLicenses.listFiles()
    .then((filesList) => myLicenses.licenses(filesList))
    .then((licenseList) => myLicenses.normalize(licenseList))

  t.true(Object.keys(aggregatedLicenses).length !== 0)
  t.true(typeof aggregatedLicenses === 'object')
})

test('fail if licenses passed to normalize is not an array', async t => {

  let myLicenses = new LicenseCheck()
  const normalizedLicenses = await myLicenses.normalize('')

  t.false(normalizedLicenses)
})
