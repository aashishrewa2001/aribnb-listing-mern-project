const mongoose = require("mongoose");
const initDdata = require("./data.js");

const  Listing = require("../models/listings.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb_db";

main().then(()=>{
    console.log("DB is connected..");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);    
}

const initDB = async () =>{
    await Listing.deleteMany({});
    await Listing.insertMany(initDdata.data);
    console.log("data was inittialized");
}

initDB();