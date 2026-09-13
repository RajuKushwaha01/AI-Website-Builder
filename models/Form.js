const mongoose = require("mongoose");

const formFieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    fieldType: {
      type: String,
      enum: ["text", "email", "phone", "number", "dropdown", "checkbox", "radio", "textarea", "date"],
      required: true
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] }, // for dropdown/radio
    order: { type: Number, default: 0 }
  },
  { _id: true }
);

const formSchema = new mongoose.Schema(
  {
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    name: { type: String, required: true },
    fields: [formFieldSchema],
    notifyEmail: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);