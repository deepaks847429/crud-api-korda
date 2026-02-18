const BaseController = require("./base.controller");
const Payload        = require("../models/payload.model");

class PayloadController extends BaseController {
  constructor() { super(Payload); }
}

module.exports = new PayloadController();
