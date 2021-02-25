import clownface from 'clownface-io'
import { PassThrough } from 'stream'
import { readable } from 'duplex-to'
import { csvw as _csvw } from '@tpluscode/rdf-ns-builders'
import { fetch } from './protoFetch.js'

const json = /json$/i

function fetchMapping (csvw) {
  return async () => {
    const mappings = await clownface().namedNode(csvw).fetch({
      contentTypeLookup: (ext) => json.test(ext) ? 'application/ld+json' : undefined
    })

    const [failedFetch] = [...mappings.failures]
    if (failedFetch) {
      const [, errorDetails] = failedFetch
      throw errorDetails.error
    }

    return mappings
  }
}

function fetchDataFile (mappings) {
  const url = mappings.any().has(_csvw.url).out(_csvw.url).value
  return fetch(url)
}

export default function fetchCsv ({ csvw }) {
  const csvStream = new PassThrough()

  Promise.resolve()
    .then(fetchMapping(csvw))
    .then(fetchDataFile)
    .then(response => {
      response.body.pipe(csvStream)
    })
    .catch(error => {
      csvStream.emit('error', error)
    })

  return readable(csvStream)
}
