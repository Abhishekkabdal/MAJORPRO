if(process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");//  ./ MEANS LOKKING IN SAME DIRECTORY WHILE ../ MEANS LOKING CURRENT'S PARENT DIRECTORY
const path = require("path");//HELPS IN PERFORMING VARIOUS OPERATION ON PATHS LIKE PATH JOIN,ABSOLUTE PATH ETC.
const methodOverride = require("method-override");//HTML CAN HANDLE ONLY GET & POST REQUEST BUT USING METHOD OVER-RIDE IT CAN HANDLE DELETE & PUT REQUEST AS WELL
const ejsMate = require("ejs-mate"); //  It enhances EJS by providing additional features and utilities for template rendering.
const wrapAsync = require("./utills/wrapAsync.js");
const ExpressError = require("./utills/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");//Files with grey text like this one,Listing ,wrapAsync are not bring used here .
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash"); 
const passport = require("passport");
const LocalStrategy  = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//CONNECTING WITH DATABASES

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

main() 
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
    await mongoose.connect(dbUrl);
}
//------------------------------------------------------------------------------------------

app.set("view engine", "ejs");//templating & rendering
app.set("views",path.join(__dirname,"views"));//joining path
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride("_method"));//diffrent request's handle
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});


store.on("error", () => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});


const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,// expiration of cookie(time is mentioned as 7 days in millisecond--- It means that 7 days you doesn't have to login ,after 7 days browser will ask to for relogin)
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};






app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
});
/*
app.get("/demouser", async ( req, res) => {
  let fakeUser = new User ({
    email: "student@gmail.com",
    username: "delta-student",
  });

  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});
*/


app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all("*",( req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode=500, message="something went wrong!" } =  err;
  res.status(statusCode).render("error.ejs",{ message });
  //res.status(statusCode).send(message); 

});

app.listen(8080,() => {
    console.log("server is listening on port 8080");
});