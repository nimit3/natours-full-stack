const express = require("express");
const morgan = require("morgan"); //middleware for makinfg life easier for log in
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

//////////////////////////////////////////MIDDLEWARE/////////////////////////////////
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  // morgan will give us like example ==== GET /api/v1/tours 200 3.154 ms - 9073
  app.use(morgan("dev"));
}
app.use(express.json());

//we can even serve static files using build in express middleware ex === serving html file or any images. we only need to apss the directory name and all those files in htat directroy will be accessed
app.use(express.static(`${__dirname}/public`)); //(http://localhost:3000/overview.html  that link will open up that file)

//creating our own middleare function
app.use((req, res, next) => {
  console.log("Hello from the Middleare😁");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

////////////////////////////////////////////ROUTING///////////////////////////////////////
//touRouter will work as a middleware
app.use("/api/v1/tours", tourRouter);
//for user router
app.use("/api/v1/users", userRouter);

/////////////////////////////////////////LISTENING SERVER///////////////////////////////

module.exports = app;