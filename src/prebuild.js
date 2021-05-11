const fs = require('fs').promises
const path = require('path')
const config = require('./web-ext-config.js')

// Some platform differences in Firefox require manifest changes before distribution.
const adjustManifest = async () => {
  const fileOptions = { encoding: 'utf8' }
  const manifestPath = path.join(
    path.resolve(__dirname, config.sourceDir),
    'manifest.json'
  )
  const manifest = JSON.parse(await fs.readFile(manifestPath), fileOptions)

  // https://bugzilla.mozilla.org/show_bug.cgi?id=1380812
  manifest.incognito = 'spanning'
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/offline_enabled
  delete manifest.offline_enabled

  await fs.writeFile(manifestPath, JSON.stringify(manifest), fileOptions)
}

adjustManifest()
