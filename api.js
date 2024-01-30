const knex = require('./db')

const service = require('./service')

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
  throw new Error('This method has not been implemented yet.')
}
