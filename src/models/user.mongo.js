import mongoose from "mongoose";

const userMongoSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true }, // Relaciona con PostgreSQL
    preferences: { type: Object, default: {} },
    pictograms: { type: Array, default: [] },
  },
  { timestamps: true }
);

const UserMongo = mongoose.model("UserMongo", userMongoSchema);

export default UserMongo;
