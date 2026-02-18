const { Router } = require("express");
const { validateId, validateBulkDelete, validateColumnUpdate } = require("../middleware/validate");

/**
 * Pass any controller → get all 8 routes wired up.
 *
 *  GET    /              → getAll   (filter body + pagination query)
 *  GET    /columns       → getColumns
 *  PUT    /columns       → updateColumns
 *  DELETE /bulk          → bulkDelete
 *  GET    /:id           → getById
 *  POST   /              → create
 *  PUT    /:id           → update
 *  DELETE /:id           → remove
 */
const createRouter = (controller) => {
  const router = Router();

  router.get   ("/columns", controller.getColumns);
  router.put   ("/columns", validateColumnUpdate, controller.updateColumns);
  router.delete("/bulk",    validateBulkDelete,   controller.bulkDelete);

  router.get   ("/",    controller.getAll);
  router.post  ("/",    controller.create);
  router.get   ("/:id", validateId, controller.getById);
  router.put   ("/:id", validateId, controller.update);
  router.delete("/:id", validateId, controller.remove);

  return router;
};

module.exports = createRouter;
