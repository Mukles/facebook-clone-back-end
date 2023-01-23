const session = require("express-session");
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const authRoute = require("./routes/auth");
const authCheck = require("./middleware/authCheck");
const userRoute = require("./routes/user");
const postRoute = require("./routes/post");
const conversationRoute = require("./routes/conversation");
const commentRoute = require("./routes/comment");
const searchRoute = require("./routes/search");

const { port, cookie_secret, mongoUrl, clientUrl } = require("./config");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/common/errorHanlder");
const app = express();

//middleware
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("common"));

app.use(
  session({
    secret: cookie_secret,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(
  cors({
    origin: clientUrl,
    methods: "GET,POST,PUT,DELETE, PATCH",
    credentials: true,
  })
);

// set static folder
app.use(express.static(path.join(__dirname, "uploads")));

app.get("/hello", (req, res) => {
  res.status(200).json({ message: "hellow world" });
});

app.use(authCheck);
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);
app.use("/api/auth", authRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/comment", commentRoute);
app.use("/api/search", searchRoute);

async function main() {
  await mongoose.connect(mongoUrl);
}

main().catch((err) => console.log(err));

// 404 not found handler
app.use(notFoundHandler);

//default error handler
app.use(errorHandler);

app.listen(port || 8080, () => {
  console.log("Server is running!", port);
});
