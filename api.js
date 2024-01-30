const knex = require('./db')

const service = require('./service')
const { reduceInBatch } = require('./utils/batch')

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
  const id = parseInt(req.params.id)

  if (!id) {
    return res.status(400).json({
      error: 'The student id must be of type integer'
    }).end()
  }

  try {
    const student = await knex('students').where({ id }).first()

    if (!student) {
      return res.status(404).json({ error: 'Student not found' }).end()
    }

    delete student.password_hash

    res.status(200).json(student).end()
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudentGradesReport(req, res, next) {
  const id = parseInt(req.params.id)

  if (!id) {
    return res.status(400).json({
      error: 'The student id must be of type integer'
    }).end()
  }

  try {
    const student = await knex('students').where({ id }).first()

    if (!student) {
      return res.status(404).json({ error: 'Student not found' }).end()
    }

    delete student.password_hash

    const grades = await service.getGrades()
    const studentGrades = grades
      .filter(item => item.id === student.id)
      .map(({ course, grade }) => ({ course, grade }))

    res.status(200).json({
      ...student,
      grades: studentGrades
    }).end()
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getCourseGradesReport(req, res, next) {
  try {
    const grades = await service.getGrades()

    const process = function (res, data) {
      data.forEach(item => {
        const [highest, lowest, sum, count] = res[item.course] || [0, 0, 0, 0]
        res[item.course] = [
          Math.max(highest, item.grade),
          Math.min(lowest, item.grade),
          sum + item.grade,
          count + 1
        ]
      })
      return res
    }

    const stats = await reduceInBatch(
      grades, process, { batchSize: 10000, initialValue: {} }
    )

    const data = Object.keys(stats)
      .sort((a, b) => a.localeCompare(b))
      .map(course => {
        const [highest, lowest, sum, count] = stats[course]

        return ({
          course,
          highest,
          lowest,
          average: Math.round(sum / count)
        })
      })

    res.status(200).json(data).end()
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}
