const BaseController = require("./base.controller");
const Device         = require("../models/device.model");

class DeviceController extends BaseController {
  constructor() { super(Device); }
}

module.exports = new DeviceController();
