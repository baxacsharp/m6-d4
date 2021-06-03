// import { body } from "express-validator"
// import { from } from "json2csv/JSON2CSVTransform";
import mongoose from "mongoose";
const { model, Schema } = mongoose;

const newSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    author: {
      type: Object,
      required: true,
    },
    content: {
      type: String,
      min: [10, "content is too  short"],
      required: true,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
);
export default model("BlogPost", newSchema);
