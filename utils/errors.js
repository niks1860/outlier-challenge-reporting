module.exports = {
  notFound,
  badRequest
}

function notFound(msg) {
  const error = new Error(msg)
  error.statusCode = 404
  return error
}

function badRequest(msg) {
  const error = new Error(msg)
  error.statusCode = 400
  return error
}
