export function notFound(req, _res, next) {
  const error = new Error(`Không tìm thấy API ${req.method} ${req.originalUrl}.`)
  error.status = 404
  next(error)
}

export function errorHandler(error, _req, res, _next) {
  const isDuplicate = error.code === 11000
  const status = error.status ?? (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : isDuplicate ? 409 : 500)
  const message = status === 500
    ? 'Đã xảy ra lỗi máy chủ.'
    : isDuplicate
      ? 'Dữ liệu đã tồn tại.'
      : error.message
  if (status >= 500) console.error(error)
  res.status(status).json({ error: message })
}
