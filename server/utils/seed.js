require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const WriterProfile = require("../models/WriterProfile");
const { ROLES, WRITER_STATUS } = require("../config/constants");

const seedPassword = process.env.SEED_PASSWORD || "WriteMate123!";

const users = [
  {
    key: "admin",
    fullName: "WriteMate Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@writemate.local",
    phone: "9000000001",
    role: ROLES.ADMIN,
    state: "Maharashtra",
    district: "Mumbai Suburban",
    city: "Mumbai",
  },
  {
    key: "customer",
    fullName: "Demo Customer",
    email: process.env.SEED_CUSTOMER_EMAIL || "customer@writemate.local",
    phone: "9000000002",
    role: ROLES.CUSTOMER,
    state: "Maharashtra",
    district: "Mumbai Suburban",
    city: "Mumbai",
  },
  {
    key: "writer",
    fullName: "Demo Writer",
    email: process.env.SEED_WRITER_EMAIL || "writer@writemate.local",
    phone: "9000000003",
    role: ROLES.WRITER,
    state: "Maharashtra",
    district: "Mumbai Suburban",
    city: "Mumbai",
  },
];

async function seed() {
  await connectDB();
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const seededUsers = {};

  for (const user of users) {
    const { key, ...userData } = user;
    const seededUser = await User.findOneAndUpdate(
      { email: userData.email.toLowerCase() },
      { $set: { ...userData, passwordHash, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    seededUsers[key] = seededUser;
  }

  await WriterProfile.findOneAndUpdate(
    { user: seededUsers.writer._id },
    {
      $set: {
        status: WRITER_STATUS.APPROVED,
        pricePerPage: 25,
        pricePerDiagram: 100,
        upiId: "demo-writer@upi",
        upiQrCodeUrl: "https://example.com/demo-writer-qr.png",
        bio: "Experienced handwriting and documentation writer.",
        serviceDescription:
          "Handwritten notes, fair copies, diagrams, and documentation.",
        isAvailable: true,
        state: seededUsers.writer.state,
        district: seededUsers.writer.district,
        city: seededUsers.writer.city,
        approvedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log("Seed completed successfully.");
  console.log(`Admin: ${seededUsers.admin.email}`);
  console.log(`Customer: ${seededUsers.customer.email}`);
  console.log(`Writer: ${seededUsers.writer.email}`);
  console.log(`Password: ${seedPassword}`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
