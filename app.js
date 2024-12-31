
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb_db";
const path = require("path");
const Listing = require("./models/listings");
const methoOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/review");
const {listingSchema, reviewSchema} = require("./schema.js");

app.engine('ejs', ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methoOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")))


main().then(()=>{
    console.log("DB is connected..");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);     
}

// validate schema of listing in server side by 
//validation schema middleware
const validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

const validateReview = (res, req, next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//GET For Listings
 app.get("/listings", wrapAsync(async(req,res,next)=>{
    const allListing = await Listing.find({});    
    res.render("listings/index.ejs",{allListing});
    }
));
//GET

//New Route For New Listing
app.get("/listings/new", (req, res,)=>{
    res.render("listings/new.ejs");
});
//New Route For New


//READ
// show route indivially
app.get("/listings/:id", wrapAsync(async(req,res,next)=>{
    let {id} = req.params;
    let listData = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listData});
}
));
//READ


//new route for----POST-
// Post request to /listings/new and redirect /listings
app.post("/listings",validateListing, wrapAsync(async(req, res, next)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save() 
        res.redirect("/listings");
    }
));
//POST
 

//EDIT UPDATE-PUT
// get request for edit
app.get("/listings/:id/edit", wrapAsync(async(req,res, next)=>{
    let {id} = req.params;
    const listData = await Listing.findById(id); 
    console.log(listData);
    res.render("listings/edit.ejs",{listData});
}
));
// get request for edit


// put resquest on update page
app.put("/listings/:id", validateListing, wrapAsync(async(req,res, next)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`)
    }
));
//EDIT UPDATE-PUT


//DELETE
app.delete("/listings/:id", wrapAsync(async(req, res, next)=>{
    let {id} = req.params;
    let deletedList =  await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    res.redirect("/listings")
}
));

//review POST route
app.post("/listings/:id/reviews", validateReview,wrapAsync(async(req, res)=>{
    let listing =  await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview); 
    await newReview.save();
    await listing.save();
    console.log("New Review saved");
    res.redirect(`/listings/${listing._id}`);

}));
//review POST route



//Delete Review route

app.delete("/listings/:id/reviews/:rid", wrapAsync(async(req, res)=>{
    let {id, rid} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: rid}});
    await Review.findByIdAndDelete(rid);

    res.redirect(`/listings/${id}`);
     
}));
//DELETE


// all unexpecting route requeste to handling error
app.all("*", (req, res, next )=>{
    next(new ExpressError(404, "Page Not Found"));
});


// middleware error handler
app.use((err, req, res, next)=>{
    let {statusCode=500, message ="Something went wrong"} = err;
    res.render("error.ejs",{message});
});


app.listen(8080,()=>{
    console.log("server is working..on port 8080");
});
 