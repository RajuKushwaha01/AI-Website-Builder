const Form = require("../models/Form");
const FormSubmission = require("../models/FormSubmission");
const Website = require("../models/Website");

exports.listForms = async (req, res) => {
  const websites = await Website.find({ owner: req.session.userId }).select("name").lean();
  const websiteIds = websites.map((w) => w._id);
  const forms = await Form.find({ website: { $in: websiteIds } }).populate("website", "name").lean();

  res.render("dashboard/forms", { user: { name: req.session.userName }, forms, websites });
};

exports.getFormBuilder = async (req, res) => {
  // req.website is populated and verified by website ownership middleware
  const website = req.website.toObject ? req.website.toObject() : req.website;

  let form = req.params.formId ? await Form.findById(req.params.formId).lean() : null;

  res.render("dashboard/form-builder", { user: { name: req.session.userName }, website, form });
};

exports.saveForm = async (req, res) => {
  const { formId, websiteId, name, fields, notifyEmail } = req.body;

  // Verify websiteId from BODY belongs to the calling user
  const website = await Website.findOne({ _id: websiteId, owner: req.session.userId });
  if (!website) {
    return res.status(403).json({ success: false, message: "You don't have access to this website." });
  }

  // If editing, ensure the existing form belongs to this website & user
  if (formId) {
    const existingForm = await Form.findOne({ _id: formId, website: websiteId });
    if (!existingForm) {
      return res.status(403).json({ success: false, message: "You don't have access to this form." });
    }
  }

  const cleanFields = (fields || []).map((f, i) => ({
    label: f.label,
    fieldType: f.fieldType,
    required: !!f.required,
    options: f.options || [],
    order: i
  }));

  let form;
  if (formId) {
    form = await Form.findByIdAndUpdate(formId, { name, fields: cleanFields, notifyEmail }, { new: true });
  } else {
    form = await Form.create({ website: websiteId, name, fields: cleanFields, notifyEmail });
  }

  res.json({ success: true, formId: form._id, message: "Form saved successfully." });
};

exports.deleteForm = async (req, res) => {
  // req.form verified by verifyFormOwnership middleware
  await req.form.deleteOne();
  await FormSubmission.deleteMany({ form: req.form._id });
  res.json({ success: true });
};

// Public submission endpoint — called from live website contact form
exports.submitForm = async (req, res) => {
  const form = await Form.findById(req.params.formId).lean();
  if (!form) return res.status(404).json({ success: false, message: "Form not found." });

  // Server-side validation against required fields
  for (const field of form.fields) {
    if (field.required && !req.body[field.label]) {
      return res.status(400).json({ success: false, message: `"${field.label}" is required.` });
    }
  }

  await FormSubmission.create({
    form: form._id,
    website: form.website,
    data: req.body,
    ip: req.ip
  });

  // Email notification log
  if (form.notifyEmail) {
    console.log(`📧 [Would send email] New submission for "${form.name}" → notify ${form.notifyEmail}`);
  }

  res.json({ success: true, message: "Thank you! Your message has been received." });
};

exports.viewSubmissions = async (req, res) => {
  // req.form verified by verifyFormOwnership middleware
  const form = req.form.toObject ? req.form.toObject() : req.form;
  const submissions = await FormSubmission.find({ form: form._id }).sort({ createdAt: -1 }).lean();

  res.render("dashboard/form-submissions", { user: { name: req.session.userName }, form, submissions });
};

// Submissions ownership verification helper (submission → form → website → owner)
async function verifySubmissionOwner(submissionId, userId) {
  const submission = await FormSubmission.findById(submissionId);
  if (!submission) return null;
  const form = await Form.findById(submission.form);
  if (!form) return null;
  const website = await Website.findOne({ _id: form.website, owner: userId });
  if (!website) return null;
  return submission;
}

exports.markSubmissionRead = async (req, res) => {
  const submission = await verifySubmissionOwner(req.params.id, req.session.userId);
  if (!submission) return res.status(403).json({ success: false, message: "You don't have access to this submission." });

  submission.read = true;
  await submission.save();
  res.json({ success: true });
};

exports.deleteSubmission = async (req, res) => {
  const submission = await verifySubmissionOwner(req.params.id, req.session.userId);
  if (!submission) return res.status(403).json({ success: false, message: "You don't have access to this submission." });

  await submission.deleteOne();
  res.json({ success: true });
};