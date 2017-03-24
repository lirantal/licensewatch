'use strict'

const test = require('ava')
const LicensesFetch = require('./index')

test('initializing the constructor with no parameters uses defaults', t => {
  let myLicenses = new LicensesFetch()
  t.is(myLicenses.filesPattern, 'node_modules/**/package.json')
})

test('initializing the constructor with a parameter is set successfully', t => {
  const filesPattern = '/tmp/something/node_modules/**/*.js'
  let myLicenses = new LicensesFetch(filesPattern)
  t.is(myLicenses.filesPattern, filesPattern)
})

test('listing files should return an array of all matched files', async t => {
  t.plan(2)

  let myLicenses = new LicensesFetch('node_modules/**/package.json')

  myLicenses.fetch()

  await new Promise((resolve, reject) => {
    myLicenses.on('files', (licenseFiles) => {
      t.true(Array.isArray(licenseFiles))
      t.true(licenseFiles.length > 0)

      resolve(licenseFiles)
    })
  })
})

test('listing files fail if the filespattern is not a string', async t => {
  t.plan(1)

  let myLicenses = new LicensesFetch(['somepattern'])

  myLicenses.fetch()

  await new Promise((resolve, reject) => {
    myLicenses.on('error', (error) => {
      t.is(error.message.indexOf('glob pattern string required') !== false, true)
      resolve(error)
    })
  })
})

test('listing files fail if the filespattern is empty', t => {
  t.plan(2)

  let myLicenses = new LicensesFetch('')

  const filesObj = myLicenses.fetch()
  t.true(typeof filesObj === 'object')
  t.true(Object.keys(filesObj).length === 0)
})

test('normalize function fails if not given an array', t => {
  t.plan(1)

  let myLicenses = new LicensesFetch('')

  const filesObj = myLicenses.normalize('')
  t.false(filesObj)
})

test('getting a single license event is successful', async t => {
  t.plan(1)

  let myLicenses = new LicensesFetch('node_modules/**/package.json')

  myLicenses.fetch()

  await new Promise((resolve, reject) => {
    myLicenses.once('license', (license) => {
      t.true(typeof license === 'string')
      resolve(license)
    })
  })
})

test('getting all licenses as a bulk array is successful', async t => {
  t.plan(1)

  let myLicenses = new LicensesFetch('node_modules/**/package.json')

  myLicenses.fetch()

  await new Promise((resolve, reject) => {
    myLicenses.on('licenses', (licenses) => {
      t.true(Array.isArray(licenses))
      resolve(licenses)
    })
  })
})

test('getting an aggregated list of licenses as a hashmap object', async t => {
  t.plan(2)

  let myLicenses = new LicensesFetch('node_modules/**/package.json')

  myLicenses.fetch()

  await new Promise((resolve, reject) => {
    myLicenses.on('licensesSummary', (data) => {
      const licenses = data.licenses

      t.true(typeof licenses === 'object')
      t.true(Object.keys(licenses).length > 0)
      resolve(licenses)
    })
  })
})
