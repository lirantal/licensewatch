# LicenseWatch

[![licensewatch](https://snyk.io/advisor/npm-package/licensewatch/badge.svg)](https://snyk.io/advisor/npm-package/licensewatch)

[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/nodejs/security-wg/blob/master/processes/responsible_disclosure_template.md)

## What is this?

This module reads the `node_modules` directory of a given
path and fetches all licenses from reading each module's
`package.json` and aggregates their counts into a hashmap
object of licenses.

## Implementation

Current implementation is with an Observable pattern so consumers need to add listeners to events the module emits.

Previous version of this module includes a [Promises-based implementation](https://github.com/lirantal/licensewatch/releases/tag/v1.0.0-promises) and complete code coverage.

## Installation

```bash
yarn add licensewatch
```

## Usage

```js
const LicenseWatch = require('licensewatch')
const licenses = new LicenseWatch('node_modules/**/package.json')

licenses.fetch()
let licensesCount = 0

licenses.on('files', (files) => {
  console.log('files processed' + ' - ' + files.length + ' - ' + files[0])
})

licenses.on('license', () => {
  licensesCount++
})

licenses.on('licenses', (licenses) => {
  console.log(licenses.length)
})

licenses.on('licensesSummary', (licenses) => {
  console.log(licenses)
})

licenses.on('error', (error) => {
  console.log('errors mate, from down under')
  console.log(error)
})
```

## Tests

Project tests:

```bash
yarn run test
```

Project linting:

```bash
yarn run lint
```

## Coverage

```bash
yarn run test:coverage
```

## Commit

The project uses the commitizen tool for standardizing changelog style commit
messages so you should follow it as so:

```bash
git add .           # add files to staging
npm run commit      # use the wizard for the commit message
```
