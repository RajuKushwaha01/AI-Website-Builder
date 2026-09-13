require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const connectDB = require("./config/db");
const { helmetMiddleware, generalLimiter } = require("./middleware/security");
const { generateToken } = require("./middleware/csrf");
const { sanitizeBody } = require("./middleware/sanitize");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const websiteRoutes = require("./routes/websiteRoutes");
const profileRoutes = require("./routes/profileRoutes");
const aiRoutes = require("./routes/aiRoutes");
const builderRoutes = require("./routes/builderRoutes");
const navigationRoutes = require("./routes/navigationRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const publishRoutes = require("./routes/publishRoutes");
const formRoutes = require("./routes/formRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const blogRoutes = require("./routes/blogRoutes");
const adminRoutes = require("./routes/adminRoutes");
const wizardRoutes = require("./routes/wizardRoutes");
const siteBackendRoutes = require("./routes/siteBackendRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

app.use(helmetMiddleware);
app.use(generalLimiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// NoSQL injection protection — strips $ and . operators from req.body/query/params
app.use(mongoSanitize());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  })
);

app.use(generateToken);

// XSS sanitization for all incoming text fields
app.use(sanitizeBody);

app.get("/", (req, res) => res.render("landing/index"));

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", websiteRoutes);
app.use("/", profileRoutes);
app.use("/", aiRoutes);
app.use("/", wizardRoutes);
app.use("/", builderRoutes);
app.use("/", navigationRoutes);
app.use("/", mediaRoutes);
app.use("/", publishRoutes);
app.use("/", formRoutes);
app.use("/", analyticsRoutes);
app.use("/", blogRoutes);
app.use("/", adminRoutes);
app.use("/", siteBackendRoutes);
app.use("/", publicRoutes); // must stay last

// 404 Handler - returns JSON for API/AJAX requests, HTML for standard navigation
app.use((req, res) => {
  if (
    req.originalUrl.startsWith("/api") ||
    req.headers.accept?.includes("application/json") ||
    req.headers["content-type"]?.includes("application/json")
  ) {
    return res.status(404).json({ success: false, message: "Route not found." });
  }
  res.status(404).render("errors/404", { message: "Page not found." });
});

// Global error handler — never leak stack traces; respond in the format the client expects.
app.use((err, req, res, next) => {
  console.error(err);
  const wantsJson =
    req.xhr ||
    req.headers.accept?.includes("application/json") ||
    req.headers["content-type"]?.includes("application/json") ||
    req.originalUrl.startsWith("/ai/") ||
    req.originalUrl.startsWith("/builder/") ||
    req.originalUrl.startsWith("/media/") ||
    req.originalUrl.startsWith("/admin/") ||
    req.originalUrl.startsWith("/forms") ||
    req.originalUrl.startsWith("/submissions") ||
    req.originalUrl.startsWith("/blog") ||
    req.originalUrl.startsWith("/websites");

  if (wantsJson) {
    return res.status(500).json({ success: false, message: "Something went wrong on our end." });
  }
  res.status(500).render("errors/404", { message: "Something went wrong on our end." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 NovaBuilder running at http://localhost:${PORT}`);
});