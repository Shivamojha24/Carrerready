const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const createMentor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "mentor@gmail.com";
    const password = "Mentor@123";

    let mentor = await User.findOne({ email });

    if (mentor) {
      mentor.name = "CareerReady Mentor";
      mentor.password = await bcrypt.hash(password, 12);
      mentor.role = "MENTOR";

      await mentor.save();

      console.log("Mentor account updated successfully");
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);

      mentor = await User.create({
        name: "CareerReady Mentor",
        email: email,
        password: hashedPassword,
        role: "MENTOR"
      });

      console.log("Mentor account created successfully");
    }

    console.log("--------------------------------");
    console.log("Mentor Email: mentor@gmail.com");
    console.log("Mentor Password: Mentor@123");
    console.log("Mentor Role: MENTOR");
    console.log("--------------------------------");

    await mongoose.connection.close();

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createMentor();