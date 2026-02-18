const BaseController = require("./base.controller");
const User           = require("../models/user.model");

class UserController extends BaseController {
  constructor() { super(User); }
}

module.exports = new UserController();
