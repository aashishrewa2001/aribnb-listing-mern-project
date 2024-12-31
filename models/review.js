const { date } = require("joi");
const mongoose = require("mongoose");
const { type } = require("os");
const Schema = mongoose.Schema;

// schema defining for Review Collection
const reviewSchema = new Schema({
    comment : String,
    rating:{
        type:Number,
        max:5,
    },
    createdDate:{
        type:Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("Review", reviewSchema);


