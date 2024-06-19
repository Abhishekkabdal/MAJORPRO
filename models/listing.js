const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { object } = require("joi");//popular js library for data validation

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image : {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    

});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }


});

const Listing = mongoose.model("Listing", listingSchema);//Listing is a collection whose structure is defined in database by listingSchema
module.exports = Listing;



