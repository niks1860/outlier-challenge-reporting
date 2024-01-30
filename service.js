const https = require('https')
const JSONStream = require('JSONStream')

module.exports = {
  getGrades
}

const url = 'https://outlier-coding-test-data.onrender.com/grades.json'

// Assuming grades data is not changing, we can cache it locally
let grades
async function getGrades() {
  if (grades) {
    return grades
  }

  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error('Failed to fetch grades'))
      }

      // parsing json is a blocking operation
      // use streaming to parse the response as it comes
      const stream = res.pipe(JSONStream.parse('*'))
      const data = []

      stream.on('data', jsonData => {
        data.push(jsonData)
      })

      stream.on('end', () => {
        grades = data
        resolve(grades)
      })

      stream.on('error', e => {
        reject(e)
      })
    })
  })
}
