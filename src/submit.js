require('dotenv').config()
const fs = require('fs').promises
fs.constants = require('fs').constants
const path = require('path')
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const FormData = require('form-data')

const generateJwt = () => {
  const issuedAt = Math.floor(Date.now() / 1000)
  const payload = {
    iss: process.env.AMO_ISSUER,
    jti: Math.random().toString(),
    iat: issuedAt,
    exp: issuedAt + 60
  }

  const secret = process.env.AMO_SECRET
  return jwt.sign(payload, secret, {
    algorithm: 'HS256'
  })
}

const submitBuild = async () => {
  const config = require('./web-ext-config.js')
  const sourceDir = path.resolve(__dirname, config.sourceDir)
  const buildDir = path.resolve(__dirname, config.artifactsDir)
  const manifest = require(path.join(sourceDir, 'manifest.json'))
  const buildPath = path.join(buildDir, `${process.env.AMO_BUILD_NAME}-${manifest.version}.zip`)
  try {
    await fs.access(buildPath, fs.constants.F_OK)
  } catch (e) {
    console.error("Built file not present to upload. Can't continue.")
    process.exit(1)
  }

  console.log('Reading release file...')
  const form = new FormData()
  form.append('upload', fs.createReadStream(buildPath))

  console.log('Configuring request...')
  const amoRestEndpoint = 'https://addons.mozilla.org/api/v5/addons'
  const serverPath = `${process.env.AMO_ADDON_GUID}/versions/${manifest.version}/`

  console.log('Submitting file to AMO...')
  const response = await fetch(`${amoRestEndpoint}/${serverPath}`, {
    method: 'PUT',
    body: form,
    headers: {
      authorization: `JWT ${generateJwt()}`
    }
  })
  const responseBody = await response.json()

  console.log('Done.')
  console.dir(responseBody)
}

submitBuild()
