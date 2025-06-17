const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    postImage: {
      type: String,
      default:
        "https://wallpapers.com/images/hd/blogging-backdrop-8ifwoxtwf7mdg268.jpg",
    },
    category: {
      type: String,
      default: "uncategorized",
    },
  },
  {
    timestamps: true,
  }
);

const PostModel = mongoose.model("post", postSchema);

module.exports = PostModel;
