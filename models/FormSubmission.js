const mongoose = require("mongoose");

const formSubmissionSchema = new mongoose.Schema(
  {
    form: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    website: { type: mongoose.Schema.Types.ObjectId, ref: "Website", required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    ip: { type: String, default: "" },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormSubmission", formSubmissionSchema);