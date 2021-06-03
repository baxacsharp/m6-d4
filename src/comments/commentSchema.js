import mongoose from "mongoose";
const { model, Schema } = mongoose;

const newSchemaComment = new Schema(
  {
    comment: {
      type: String,
      required: true,
      min: [10, "content is too  short"],
    },
    rate: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export default model("Comment", newSchemaComment);
