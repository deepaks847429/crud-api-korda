const mongoose = require("mongoose");

const colSchema = new mongoose.Schema({
  key:     { type: String, required: true },
  label:   { type: String },
  visible: { type: Boolean, default: true },
  order:   { type: Number,  required: true },
});

const schema = new mongoose.Schema(
  {
    collection: { type: String, required: true, trim: true },
    scope:      { type: String, default: "global", trim: true },
    columns:    [colSchema],
  },
  { timestamps: true }
);

schema.index({ collection: 1, scope: 1 }, { unique: true });

module.exports = mongoose.model("ColumnPreference", schema);
