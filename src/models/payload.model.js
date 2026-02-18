const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    logDate:   { type: Date, required: true },
    stepCount: { type: Number, default: 0 },
    device:    { type: String, trim: true },
  },
  { timestamps: true }
);

schema.statics.COLLECTION_NAME   = "payloads";
schema.statics.FILTERABLE_FIELDS = ["userId", "logDate", "stepCount", "device", "createdAt", "updatedAt"];
schema.statics.DEFAULT_COLUMNS   = [
  { key: "userId",    label: "User",       visible: true,  order: 0 },
  { key: "logDate",   label: "Log Date",   visible: true,  order: 1 },
  { key: "stepCount", label: "Step Count", visible: true,  order: 2 },
  { key: "device",    label: "Device",     visible: true,  order: 3 },
  { key: "createdAt", label: "Created At", visible: true,  order: 4 },
  { key: "updatedAt", label: "Updated At", visible: false, order: 5 },
];

module.exports = mongoose.model("Payload", schema);
