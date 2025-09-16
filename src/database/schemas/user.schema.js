const { DataTypes } = require("sequelize");
const sequelize = require("../postgres");

const User = sequelize.define(
  "User",
  {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "usuario"), defaultValue: "usuario" },
  },
  {
    timestamps: true,
  }
);

module.exports = User;
