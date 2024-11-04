import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost/logincrudreact");
    console.log("DB is connect");
  } catch (error) {
    console.log(error);
  }
};
