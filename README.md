# Licenses-Fetch

## What is this?

This module reads the `node_modules` directory of a given
path and fetches all licenses from reading each module's
`package.json` and aggregates their counts into an hashmap
object of licenses.

## Installation

Bold people use:

```bash
yarn add licenses-fetch
```

The rest can use the mundane:

```bash
npm install --save licenses-fetch
```

## Usage

```js
let myLicenses = new LicenseCheck()

const licenses = myLicenses.listFiles()
  .then((filesList) => {
    return myLicenses.licenses(filesList)
  })
  .then((licenseList) => {
    return myLicenses.normalize(licenseList)
  })
  .then((licensesHash) => {
    console.log(JSON.stringify(licensesHash))
  })
```

## Tests

Project tests:

```bash
npm run test
```

Project linting:

```bash
npm run lint
```

## Coverage

```bash
npm run test:coverage
```

## Commit

The project uses the commitizen tool for standardizing changelog style commit
messages so you should follow it as so:

```bash
git add .           # add files to staging
npm run commit      # use the wizard for the commit message
```
