const express = require("express");
const connection = require("./config/db");
const cors = require("cors");
const userRouter = require("./routes/user.routes");
require("dotenv").config();
var cookieParser = require("cookie-parser");
const postRouter = require("./routes/post.routes");
const commentRouter = require("./routes/comment.routes");
const path = require("path"); 

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173","http://localhost:5174"],
  credentials: true
}))



app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/comment",commentRouter)
app.use("/user", express.static(path.join(__dirname, "uploads/user")));
app.use("/post", express.static(path.join(__dirname, "uploads/post")));



app.listen(process.env.PORT || 3000, async () => {
  try {
    await connection;
    console.log("server is running");
  } catch (error) {
    console.log(error);
  }
});
