const express = require("express");
const router = express.Router();
const wrapAsync = require("../utills/wrapAsync.js");

const Listing = require("../models/listing.js");//  ./ MEANS LOKKING IN SAME DIRECTORY WHILE ../ MEANS LOKING CURRENT'S PARENT DIRECTORY
const {isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');//middlewear used in file uploading
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});








router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single("listing[image]"), validateListing,wrapAsync(listingController.createListing)
 );
      


  
//INDEX ROUTE



//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

//show route
router.get("/:id",upload.single("listing[image]"), wrapAsync(listingController.showListing));

//Create route


  
//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));
  
//Update Route
  
router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.UpdateRoute));



//delete route
router.delete("/:id",isLoggedIn,isOwner,upload.single("listing[image]"), wrapAsync(listingController.DeleteRoute));

module.exports= router;