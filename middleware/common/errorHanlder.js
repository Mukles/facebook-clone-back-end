//external imports
const createError = require("http-errors");

// 404 not found handler
function notFoundHandler(req, res, next) {
  next(createError(404, { message: "Your requested content was not found!" }));
}

// default error handler
function errorHandler(err, req, res, next) {
  const error =
    process.env.NODE_ENV === "development" ? err : { message: err.message };
  res.status(err.status || 500);
  res.json(error);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
