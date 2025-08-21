const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");
require("dotenv").config();

// PostgreSQL connection using DATABASE_URL (for Supabase)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // For Supabase SSL connection
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// PostgreSQL connection test
const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Supabase PostgreSQL connected successfully");

    // Sync models (be careful with this in production)
    await sequelize.sync({ alter: true });
    console.log("✅ PostgreSQL models synced");
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error);
    console.error("Check your DATABASE_URL in .env file");
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectMongoDB,
  connectPostgreSQL,
};
