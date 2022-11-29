const session = require("express-session");
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const authRoute = require("./routes/auth");
const authCheck = require("./middleware/authCheck");
const userRoute = require("./routes/user");
const postRoute = require("./routes/post");
const { port, cookie_secret, mongoUrl } = require("./config");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/common/errorHanlder");
const app = express();

//middleware
app.use(express.json());
app.use(helmet());
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
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE, PATCH",
    credentials: true,
  })
);
app.use(authCheck);
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);
app.use("/api/auth", authRoute);

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
