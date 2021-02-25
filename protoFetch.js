import fileFetch from 'file-fetch'
import httpFetch from 'nodeify-fetch'
import protoFetch from 'proto-fetch'

export const fetch = protoFetch({
  file: fileFetch,
  http: httpFetch,
  https: httpFetch
})

export default { fetch }
