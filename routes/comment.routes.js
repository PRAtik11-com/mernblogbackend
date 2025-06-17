const express = require("express");
const CommentController = require("../controllers/comment.controllers")
const Auth = require("../middleware/auth")
const CheckRole = require("../middleware/admin")

const commentRouter = express.Router();


commentRouter.post("/commentcreate",Auth,CommentController.createComment)
commentRouter.get(
  "/getpostcomment/:postId",
  Auth,
  CommentController.getPostComment
);

commentRouter.delete(
  "/delete/:userId/:commentId",
  Auth,
  CommentController.deleteComment
);
commentRouter.patch(
  "/update/:userId/:commentId",
  Auth,
  CommentController.editComment
);
commentRouter.get(
  "/admin/comments",
  Auth,
  CheckRole,
  CommentController.getAllComments
);
commentRouter.patch(
  "/like/:userId/:commentId",
  Auth,
  CommentController.likesComments
);

module.exports = commentRouter