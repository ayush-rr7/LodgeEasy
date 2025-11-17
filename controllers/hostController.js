const registeredHomes = [];
const User = require("../models/user");
const Home =require ("../models/home");
const Booking =require ("../models/booking");
// const {upload}= require("../upload");
const fs=require("fs");


exports.getAddHome = (req, res, next) => {
  // res.render("host/edit-home", {
   res.render('host/add-home',{
    isLoggedIn:req.isLoggedIn ,
    user:req.session.user,
    pageTitle: "Add Home to LodgeEasy",
    // currentPage: "addHome",
    // editing: false,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("home-list");
    }

    console.log(homeId, editing, home);
    res.render("host/edit-home", {
    // res.render("host/add-home", {
      home: home,
      isLoggedIn:req.isLoggedIn, 
      user:req.session.user,
      pageTitle: "Edit your Home",
      // currentPage: "host-homes",
      editing: editing,
    });
  });
};

exports.getHostHomes = (req, res, next) => {
   const usersId = req.session.user._id; 
  Home.find({ usersId: usersId }).then((registeredHomes) => {
    
    res.render("host/home-list", {
       isLoggedIn:req.isLoggedIn ,
      registeredHomes: registeredHomes,
      user:req.session.user,
      pageTitle: "Host Homes List",
      // currentPage: "host-homes",
    });
  });
};

exports.postAddHome = (req, res, next) => {
  const { name, price, city, description, maxGuests,homeType,
  amenities, } =req.body;
  console.log(req.body);
  if(!req.file){
    return res.status(422).send("no image provided");
  }
  const usersId= req.session.user._id;
  const imageURL = req.file.path;
  console.log(imageURL);
  console.log(usersId);
  const home= new Home({
    name,
    price,
    city,
    imageURL,
    description,
     maxGuests,
     homeType,
  amenities,
    usersId,

  });
  console.log(home);

  home.save().then(() => {
    console.log("Home Saved successfully");
      res.render('host/homeAdded',{
        isLoggedIn:req.isLoggedIn,
         registeredHomes: registeredHomes,
         user:req.session.user,
          pageTitle: "HomeAdded",
        }); 

  });

  
}
exports.getBookings=(req,res, next)=>{
  //  res.render("host/bookings");
  const hostId= req.session.user._id;
      Booking.find({hostId : hostId}).then((registeredHomes) => {
      res.render('host/bookings', {
        registeredHomes: registeredHomes,
        isLoggedIn:req.isLoggedIn,
        user:req.session.user,
         pageTitle: "Your Bookings",
       
      });
    });
  

}
// )};

exports.postEditHome = (req, res, next) => {
  const { id, name, price, city, maxGuests,homeType, description,
  amenities,} =
    req.body;
    const usersId= req.session.user._id;
    console.log(usersId);
    Home.findById(id).then((home) => {
    home.name = name;
    home.price = price;
    home.city = city;
    home.maxGuests=maxGuests;
    home.amenities=amenities;
    home.description = description;
    home.homeType=homeType;
    home.usersId=usersId;
    // console.log(req.body);
if (req.file) {
        fs.unlink(home.imageURL, (err) => {
          if (err) {
            console.log("Error while deleting file ", err);
          }
        });
        home.imageURL = req.file.path;
      }
  
    home.save().then((result) => {
      console.log("Home updated ", result);
    }).catch(err => {
      console.log("Error while updating ", err);
    })
    res.redirect("/host/home-list");
  }).catch(err => {
    console.log("Error while finding home ", err);
  });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log( homeId,"deleted");
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/home-list");
    })
    .catch((error) => {
      console.log("Error while deleting ", error);
    });
};