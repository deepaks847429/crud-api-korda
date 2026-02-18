const success  = (res, data = {}, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, ...data });

const created  = (res, data = {}) =>
  success(res, data, "Created successfully", 201);

const error    = (res, message = "Something went wrong", status = 500, errors = null) =>
  res.status(status).json({ success: false, message, ...(errors && { errors }) });

const notFound = (res, message = "Resource not found") => error(res, message, 404);

const badRequest = (res, message = "Bad request", errors = null) => error(res, message, 400, errors);

module.exports = { success, created, error, notFound, badRequest };
