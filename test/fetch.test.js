import { describe, it, beforeEach, before, after } from 'mocha'
import chai from 'chai';
import { create } from 'barnard59/lib/runner.js'
import { resolve, dirname } from 'path'
import clownface from 'clownface-io'
import rdf from '@rdfjs/data-model';
import toString from 'stream-to-string'
import toStream from 'string-to-stream'
import sinon from 'sinon';
import proto, { fetch } from '../protoFetch.js'

const { restore, stub } = sinon;
const { expect } = chai;
const { namedNode } = rdf;

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('fetch', function () {
  const pipelinesPath = 'file:' + resolve(__dirname, 'pipelines/fetch.ttl')
  const basePath = resolve(__dirname, '..')

  let variable
  const outputStream = process.stdout

  before(() => {
    restore()
    stub(proto, 'fetch')
  })

  beforeEach(() => {
    variable = new Map()
    variable.set('basePath', resolve(__dirname, '..'))
  })

  after(() => {
    restore()
  })

  it('parses local JSON-LD mappings and fetches remote CSV', async () => {
    // given
    const pipeline = await clownface().namedNode(pipelinesPath).fetch()

    const run = create({
      outputStream,
      variable,
      basePath,
      dataset: pipeline.dataset,
      term: namedNode('urn:barnard59-csvw:test#LocalCsvw-HttpCsv')
    })
    proto.fetch.resolves({
      body: toStream('foo,bar,baz\n10,20,30')
    })

    // when
    const result = await toString(run.pipeline)

    // then
    expect(result).to.eq('foo,bar,baz\n10,20,30')
    expect(fetch).to.have.been.calledWith('http://example.com/test.csv')
  })

  it('emits error if CSV fails to load ', async () => {
    // given
    const pipeline = await clownface().namedNode(pipelinesPath).fetch()
    const run = create({
      outputStream,
      variable,
      basePath,
      dataset: pipeline.dataset,
      term: namedNode('urn:barnard59-csvw:test#LocalCsvw-HttpCsv')
    })
    proto.fetch.rejects(new Error('Not Found'))

    // when
    const result = new Promise((resolve, reject) => {
      run.pipeline.on('end', resolve)
      run.pipeline.on('error', reject)
    })
    run.pipeline.on('data', () => {})

    // then
    await expect(result).to.have.been.rejected
  })

  it('emits error if CSVW fails to load ', async () => {
    // given
    const pipeline = await clownface().namedNode(pipelinesPath).fetch()
    const run = create({
      outputStream,
      variable,
      basePath,
      dataset: pipeline.dataset,
      term: namedNode('urn:barnard59-csvw:test#MissingCsvw')
    })

    // when
    const result = new Promise((resolve, reject) => {
      run.pipeline.on('end', resolve)
      run.pipeline.on('error', reject)
    })
    run.pipeline.on('data', () => {})

    // then
    await expect(result).to.have.been.rejected
  })
})
