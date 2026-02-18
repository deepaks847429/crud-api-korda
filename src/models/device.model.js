const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    logDate:      { type: Date, required: true },
    stepCount:    { type: Number, default: 0 },
    device:       { type: String, trim: true },
    batteryLevel: { type: Number, min: 0, max: 100 },   // ← extra field
  },
  { timestamps: true }
);

schema.statics.COLLECTION_NAME   = "devices";
schema.statics.FILTERABLE_FIELDS = ["userId", "logDate", "stepCount", "device", "batteryLevel", "createdAt", "updatedAt"];
schema.statics.DEFAULT_COLUMNS   = [
  { key: "userId",       label: "User",          visible: true,  order: 0 },
  { key: "logDate",      label: "Log Date",      visible: true,  order: 1 },
  { key: "stepCount",    label: "Step Count",    visible: true,  order: 2 },
  { key: "device",       label: "Device",        visible: true,  order: 3 },
  { key: "batteryLevel", label: "Battery Level", visible: true,  order: 4 },
  { key: "createdAt",    label: "Created At",    visible: true,  order: 5 },
  { key: "updatedAt",    label: "Updated At",    visible: false, order: 6 },
];

module.exports = mongoose.model("Device", schema);
