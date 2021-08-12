const { stringify } = require('@angular/compiler/src/util');
const path= require('path')
const express = require('express');
const bodyParser= require("body-parser");
const mongoose= require('mongoose');
const postsRoutes = require('./routes/posts')
const userRoutes = require('./routes/user')

const app= express();

mongoose.Promise = global.Promise;

const mongoAtlasUri =
"mongodb+srv://Amish:"+ process.env.MONGO_ATLAS_PW + "@cluster0.m8jvc.mongodb.net/node-angular?retryWrites=true&w=majority";

//mongodb+srv://Amish:hm9r0j4Srwk0rBPN@cluster0.m8jvc.mongodb.net/node-angular?retryWrites=true&w=majority
try {
  // Connect to the MongoDB cluster
  mongoose.connect(
    mongoAtlasUri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(" Mongoose is connected")
  );
} catch (e) {
  console.log("could not connect");
}

const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use("/images", express.static(path.join("backend/images")));
//app.use("/images", express.static(path.join("images"))); deployment


app.use((req, res, next)=>{
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader(
  'Access-Control-Allow-Headers',
  "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS, PUT")
  next();
});

app.use("/api/posts" , postsRoutes)
app.use("/api/user" , userRoutes)


module.exports = app;
