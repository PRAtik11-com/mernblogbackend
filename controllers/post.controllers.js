const PostModel = require("../models/post.model");
const { post, options } = require("../routes/user.routes");

const postcontroller = {
  createPost: async (req, res) => {
    if (!req.body.title || !req.body.content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    try {
      const userId = req?.user?._id;

      const post = await PostModel.create({ ...req.body, userId });
      res.status(201).json({
        message: "Post created successfully",
        post,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // delete post

  deletePost: async (req, res) => {
    const { postId, userId } = req.params;

    if (req.user._id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    try {
      const post = await PostModel.findByIdAndDelete(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // update post

  updatePost: async (req, res) => {
    const { postId, userId } = req.params;

    if (req.user._id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    if (!req.file) {
      const updateprofile = await PostModel.findByIdAndUpdate(postId, {
        $set: { ...req.body },
      });
      if (!updateprofile) {
        return res.status(400).json({ message: "Error while updating post" });
      }
      res.status(200).json({ message: "Data updated successfully" });
    }
    if (req.file) {
      const updateprofile = await PostModel.findByIdAndUpdate(postId, {
        $set: { ...req.body, postImage: req.file.originalname },
      });
      if (!updateprofile) {
        return res.status(400).json({ message: "Error while updating post" });
      }
      res.status(200).json({ message: "Data updated successfully" });
    }
  },

  getSinglePost: async (req, res) => {
    const { postId } = req.params;
    try {
      const post = await PostModel.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(200).json({ message: "Post fetched successfully", post });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAllpost: async (req, res) => {
  const limit = req.query.limit || 2;
  const startIndex = req.query.startIndex || 0;
  const sort = req.query.sort || "createdAt";
  const order = req.query.order || "asc";
  const search = req.query.search || "";
  const category = req.query.category || ""; 
  const totalPosts = await PostModel.countDocuments();

  console.log("limit", limit);
  try {
    const filterQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    };

  
    if (category && category !== "uncategorized") {
      filterQuery.category = category;
    }

    const posts = await PostModel.find(filterQuery)
      .limit(limit)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip(startIndex);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }

    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
      totalPosts,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
},
};

module.exports = postcontroller;
