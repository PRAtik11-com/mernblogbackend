const Commentmodel = require("../models/comment.model");

const CommentController = {
  createComment : async (req, res) =>{
    try {
        const makecomments = await Commentmodel.create({...req.body})
        res.status(201).json({ message: "Comment created successfully", makecomments })
    } catch (error) {
        res.status(500).json({message : error.message})
    }
  },
  getPostComment: async (req, res) => {
      const { postId } = req.params;
      try {
        const comments = await Commentmodel.find({ postId: postId });
  
        if (!comments || comments.length === 0) {
          return res.status(404).json({ message: "No comments found" });
        }
  
        res
          .status(200)
          .json({ message: "Comments retrieved successfully", comments });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
    deleteComment: async (req, res) => {
      const { commentId, userId } = req.params;
  
      if (req.user._id !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this comment" });
      }
      try {
        const deletedComment = await Commentmodel.findByIdAndDelete(commentId);
        if (!deletedComment) {
          return res.status(404).json({ message: "Comment not found" });
        }
        res.status(200).json({ message: "Comment deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
    editComment: async (req, res) => {
      const { commentId, userId } = req.params;
      const { comment } = req.body;
  
      if (req.user._id !== userId) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment" });
      }
      try {
        const updatedComment = await Commentmodel.findByIdAndUpdate(
          commentId,
          {
            $set: { comment },
          },
          { new: true }
        );
        if (!updatedComment) {
          return res.status(404).json({ message: "Comment not found" });
        }
        res
          .status(200)
          .json({ message: "Comment updated successfully", updatedComment });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
    getAllComments: async (req, res) => {
      const sort = req.query.sort || "createdAt";
      const order = req.query.order || "asc";
      const limit = req.query.limit || 2;
      const totalComments = await Commentmodel.countDocuments();
  
      try {
        const comments = await Commentmodel.find()
          .sort({ [sort]: order })
          .limit(limit);
  
        if (!comments || comments.length === 0) {
          return res.status(404).json({ message: "No comments found" });
        }
        res
          .status(200)
          .json({ message: "Comments retrieved successfully", comments ,totalComments});
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
    likesComments: async (req, res) => {
      const comment = await Commentmodel.findById(req.params.commentId);
      if (!comment || comment.length === 0) {
        return res.status(404).json({ message: "No comments found" });
      }
  
      const index = comment.likes.indexOf(req.params.userId);
  
      if (index == -1) {
        comment.likes.push(req.params.userId);
        comment.numberOfLikes += 1;
      } else {
        comment.numberOfLikes -= 1;
        comment.likes.splice(index, 1);
      }
      try {
        await comment.save();
        res.status(200).json({
          message: "Comment liked successfully",
          likes: comment.likes,
          numberOfLikes: comment.numberOfLikes,
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    },
}

module.exports = CommentController;