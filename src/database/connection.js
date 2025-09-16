import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(">>> MI AMOR ME CONECTE A MONGO");
  } catch (error) {
    console.log(error);
  }
};
