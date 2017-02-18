# Licenses-Fetch

## What is this?

This module reads the `node_modules` directory of a given
path and fetches all licenses from reading each module's
`package.json` and aggregates their counts into a hashmap
object of licenses.

## Implementation

Current implementation is with an Observable pattern so consumers need to add listeners to events the module emits.

Previous version of this module includes a [Promises-based implementation](https://github.com/lirantal/licenses-fetch/releases/tag/v1.0.0-promises) and complete code coverage.

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

const licenses = new LicensesFetch('node_modules/**/package.json')

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

licenses.on('licensesNormalized', (licenses) => {
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
