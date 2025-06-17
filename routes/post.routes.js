const express = require("express");
const postcontroller = require("../controllers/post.controllers");
const Auth = require("../middleware/auth");
const upload = require("../config/multer");

const postRouter = express.Router();

postRouter.post("/createpost", Auth, postcontroller.createPost);
// delete single post
postRouter.delete("/delete/:userId/:postId", Auth, postcontroller.deletePost);
postRouter.patch(
  "/update/:userId/:postId",
  Auth,
  upload.single("postImage"),
  postcontroller.updatePost
);

postRouter.get("/getsinglepost/:postId", Auth, postcontroller.getSinglePost);
postRouter.get("/getallposts", Auth, postcontroller.getAllpost);



module.exports = postRouter;
