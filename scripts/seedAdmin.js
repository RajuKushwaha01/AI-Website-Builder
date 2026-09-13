require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log("Usage: npm run seed:admin -- admin@example.com YourPassword123");
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`✅ Existing user ${email} promoted to admin.`);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      name: "Admin",
      username: "admin_" + Date.now().toString().slice(-5),
      email,
      password: hashed,
      role: "admin"
    });
    console.log(`✅ Admin account created: ${email}`);
  }

  process.exit(0);
}

seed();