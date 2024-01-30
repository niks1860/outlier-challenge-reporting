const knex = require('./db')

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

async function getHealth (req, res, next) {
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

    res.status(200).json(student).end()
  } catch (e) {
    console.log(e)
    res.status(500).end()
  }
}

async function getStudentGradesReport (req, res, next) {
  throw new Error('This method has not been implemented yet.')
}

async function getCourseGradesReport (req, res, next) {
  throw new Error('This method has not been implemented yet.')
}
