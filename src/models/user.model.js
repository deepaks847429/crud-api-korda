const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:       { type: String, trim: true },
    role:        { type: String, enum: ["admin", "user", "moderator"], default: "user" },
    isActive:    { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

schema.statics.COLLECTION_NAME   = "users";
schema.statics.FILTERABLE_FIELDS = ["name", "email", "phone", "role", "isActive", "lastLoginAt", "createdAt", "updatedAt"];
schema.statics.DEFAULT_COLUMNS   = [
  { key: "name",        label: "Name",       visible: true,  order: 0 },
  { key: "email",       label: "Email",      visible: true,  order: 1 },
  { key: "phone",       label: "Phone",      visible: true,  order: 2 },
  { key: "role",        label: "Role",       visible: true,  order: 3 },
  { key: "isActive",    label: "Active",     visible: true,  order: 4 },
  { key: "lastLoginAt", label: "Last Login", visible: true,  order: 5 },
  { key: "createdAt",   label: "Created At", visible: true,  order: 6 },
  { key: "updatedAt",   label: "Updated At", visible: false, order: 7 },
];

module.exports = mongoose.model("User", schema);
