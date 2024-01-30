const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error('Error connecting to sqlite database; did you initialize it by running `npm run init-db`?')
    }
    t.ok(data.success, 'should have successful healthcheck')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('getStudentById', async function (t) {
  const urlPrefix = `${endpoint}/student`

  try {
    const { response } = await jsonist.get(`${urlPrefix}/foo`)

    t.equal(response.statusCode, 400, 'Shoud fail request validation')
  } catch (e) {
    t.error(e)
  }

  try {
    const { data } = await jsonist.get(`${urlPrefix}/1`)

    t.ok(data, 'Should return sucessful response')
    t.equal(data.id, 1, 'Should return student with `id` equals to 1')
  } catch (e) {
    t.error(e)
  }

  try {
    const { response } = await jsonist.get(`${urlPrefix}/111111111111`)

    t.equal(response.statusCode, 404, 'Should return not found')
  } catch (e) {
    t.error(e)
  }
})

tape('getStudentWithGradesById', async function (t) {
  const urlPrefix = `${endpoint}/student`

  try {
    const { response } = await jsonist.get(`${urlPrefix}/foo/grades`)

    t.equal(response.statusCode, 400, 'Shoud fail request validation')
  } catch (e) {
    t.error(e)
  }

  try {
    const { data } = await jsonist.get(`${urlPrefix}/1/grades`)

    t.ok(data, 'Should return sucessful response')
    t.equal(data.id, 1, 'Should return student with `id` equals to 1')
    t.ok(data.grades, 'Should contain student grades')
  } catch (e) {
    t.error(e)
  }

  try {
    const { response } = await jsonist.get(`${urlPrefix}/111111111111/grades`)

    t.equal(response.statusCode, 404, 'Should return not found')
  } catch (e) {
    t.error(e)
  }
})

tape('cleanup', function (t) {
  server.closeDB()
  server.close()
  t.end()
})
