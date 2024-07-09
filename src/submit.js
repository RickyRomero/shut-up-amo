require('dotenv').config()
const fs = require('fs').promises
fs.constants = require('fs').constants
const { createReadStream } = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const FormData = require('form-data')

const processingPolls = 6
const amoRestEndpoint = 'https://addons.mozilla.org/api/v5/addons'

const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

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

const prepareBuild = async () => {
  console.log('Preparing build...')

  const config = require('./web-ext-config.js')
  const sourceDir = path.resolve(__dirname, config.sourceDir)
  const buildDir = path.resolve(__dirname, config.artifactsDir)
  const manifest = require(path.join(sourceDir, 'manifest.json'))
  const buildPath = path.join(buildDir, `${process.env.AMO_BUILD_NAME}-${manifest.version}.zip`)

  try {
    await fs.access(buildPath, fs.constants.F_OK)
    return buildPath
  } catch (e) {
    console.error("Built file not present to upload. Can't continue.")
    process.exit(1)
  }
}

const submitBuild = async (buildPath) => {
  console.log('Reading release file...')

  const form = new FormData()
  form.append('upload', createReadStream(buildPath))
  form.append('channel', 'listed')

  console.log('Configuring request...')
  const serverPath = 'upload/'

  console.log('Submitting file to AMO...')
  const response = await fetch(`${amoRestEndpoint}/${serverPath}`, {
    method: 'POST',
    body: form,
    headers: {
      authorization: `JWT ${generateJwt()}`
    }
  })
  const body = await response.json()

  if (!body.uuid) {
    console.error('The server failed to issue an upload ID.')
    console.dir(body)
    process.exit(1)
  } else {
    console.log('Uploaded successfully.')
    return body.uuid
  }
}

const addonProcessing = async (uploadId) => {
  console.log('Awaiting addon processing.')

  console.log('Configuring request...')
  const serverPath = `upload/${uploadId}/`

  for (let attempts = 1; attempts <= processingPolls; attempts += 1) {
    console.log(`Polling server (attempt ${attempts} of ${processingPolls})`)
    const response = await fetch(`${amoRestEndpoint}/${serverPath}`, {
      method: 'GET',
      headers: {
        authorization: `JWT ${generateJwt()}`
      }
    })
    const body = await response.json()

    try {
      if (body.processed === false) {
        if (attempts === processingPolls) {
          console.log('Upload still not processed by the server. Stopping.')
          console.dir(body)
          process.exit(1)
        }
  
        const delay = 2 ** attempts
        console.log(`Upload not yet processed. Waiting ${delay} seconds.`)
        await pause(delay * 1000)
      } else {
        console.log('Upload processed.')
  
        if (body.valid === false) {
          console.log('Upload deemed invalid by the server. Stopping.')
          console.dir(body)
          process.exit(1)
        } else {
          console.log('Upload is valid! Continuing...')
          return
        }
      }
    } catch (e) {
      console.log('Unexpected error:')
      console.error(e)
      console.dir(body)
      process.exit(1)
    }
  }
}

const addVersionMetadata = async (uploadId) => {
  console.log('Adding version metadata for release.')

  console.log('Configuring request...')
  const serverPath = `addon/${process.env.AMO_ADDON_SLUG}/versions/`
  const versionMetadata = {
    approval_notes: '',
    compatibility: {
      firefox: {
        min: '124.0'
      },
      android: {
        min: '124.0'
      }
    },
    license: 'MIT',
    release_notes: {
      "en-US": "This brand-new version doesn't have release notes yet. Please check back shortly."
    },
    source: null,
    upload: uploadId
  }


  console.log('Submitting version metadata...')
  const response = await fetch(`${amoRestEndpoint}/${serverPath}`, {
    method: 'POST',
    body: JSON.stringify(versionMetadata),
    headers: {
      authorization: `JWT ${generateJwt()}`,
      'content-type': 'application/json; charset=utf-8'
    }
  })
  const body = await response.json()

  console.log('Version metadata submitted.')
  if (!body.id) { // If we don't get an ID back, it probably failed.
    console.log('Looks like this version already exists.')
    console.dir(body)
    process.exit(1)
  } else {
    return
  }
}

;(async () => {
  const buildPath = await prepareBuild()
  const uploadId = await submitBuild(buildPath)
  await addonProcessing(uploadId)
  await addVersionMetadata(uploadId)
})()
