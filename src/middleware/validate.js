const { body, param, validationResult } = require("express-validator");
const res_ = require("../utils/response");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  return errors.isEmpty() ? next() : res_.badRequest(res, "Validation failed", errors.array());
};

const validateId= [param("id").isMongoId().withMessage("Invalid ID"), validate];
const validateBulkDelete  = [body("ids").isArray({ min: 1 }), body("ids.*").isMongoId(), validate];
const validateColumnUpdate = [body("columns").isArray({ min: 1 }), body("columns.*.key").notEmpty(), validate];

module.exports = { validate, validateId, validateBulkDelete, validateColumnUpdate };
