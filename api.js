const { getStudentById } = require('./crud/students')
const knex = require('./db')

const service = require('./service')
const { badRequest, notFound } = require('./utils/errors')

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

// Assuming grades data isn't changing, we can start fetching big data
// to reduce response time
service.getGrades()

async function getHealth(req, res, next) {
  try {
    await knex('students').first()
    res.json({ success: true })
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudent(req, res, next) {
  const id = req.params.id
  if (!/^\d+$/.test(id)) {
    return next(badRequest('The student id must be a positive integer'))
  }

  const student = await getStudentById(id)
  if (!student) {
    return next(notFound('Student not found'))
  }

  res.json(student)
}

async function getStudentGradesReport(req, res, next) {
  const id = req.params.id
  if (!/^\d+$/.test(id)) {
    return next(badRequest('The student id must be a positive integer'))
  }

  const student = await getStudentById(id)
  if (!student) {
    return next(notFound('Student not found'))
  }

  try {
    const grades = await service.getGrades()
    const studentGrades = grades.filter(item => item.id === student.id)
    res.json({ ...student, grades: studentGrades })
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getCourseGradesReport(req, res, next) {
  try {
    const grades = await service.getGrades()

    const summary = {}
    const batchSize = 10000

    // Process the items in batches to keep the main thread unblocked
    const process = function (data) {
      if (!data || !data.length) {
        // no more items available, prepare and return result response
        const result = Object.entries(summary)
          .map(([course, value]) => {
            const [highest, lowest, sum, count] = value
            return ({
              course,
              highest,
              lowest,
              average: Math.round(sum / count)
            })
          })
          .sort((a, b) => a.course.localeCompare(b.course))

        return res.json(result)
      }

      // process current batch
      data.slice(0, batchSize).forEach(item => {
        const [highest, lowest, sum, count] = summary[item.course] || [0, 0, 0, 0]

        summary[item.course] = [
          Math.max(highest, item.grade),
          Math.min(lowest, item.grade),
          sum + item.grade,
          count + 1
        ]
      })

      // schedule next batch
      setImmediate(() => process(data.slice(batchSize)))
    }

    process(grades)
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}
