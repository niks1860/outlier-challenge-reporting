const knex = require('../db')

module.exports = {
  getStudentById
}

async function getStudentById(id) {
  const student = await knex('students').where('id', id).first()
  if (!student) return

  delete student.password_hash
  return student
}
