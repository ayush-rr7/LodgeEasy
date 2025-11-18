// const Favourite = require("../models/favourite");
const User = require("../models/user");
const Home = require("../models/home");
const Booking = require("../models/booking");
const{registeredHomes}= require('../routes/hostRouter');

exports.getIndex = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render('home', {
      registeredHomes: registeredHomes,
      isLoggedIn:req.isLoggedIn,
      user:req.session.user,
      pageTitle: "All Homes",
      // currentPage: "index",
      
    });
  });
};


exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render('home', {
      registeredHomes: registeredHomes,
      isLoggedIn:req.isLoggedIn,
      user:req.session.user,
      pageTitle: "All Homes",
      // currentPage: "Home",
    });
  });
};

exports.getSearchResults = async (req, res) => {
  try {
    console.log("searchIn", req.query);

   // ------------- FETCH QUERY VALUES 
const { city, checkIn, checkOut, guests, minPrice, maxPrice,numGuests, homeType,
  amenities} = req.query;

// ------------------ BUILD HOME FILTER QUERY ----

const query = {};

// City
if (city) query.city = { $regex: new RegExp(city, "i") };

// Price filter
if (minPrice || maxPrice) query.price = {};
if (minPrice) query.price.$gte = parseInt(minPrice);
if (maxPrice) query.price.$lte = parseInt(maxPrice);

// Amenities filter
if (amenities) {
  const selected = Array.isArray(amenities)
    ? amenities
    : amenities.split(",");
  query.amenities = { $all: selected };
}

// Number of guests
if (guests) query.numGuests = { $gte: parseInt(guests) };

// Home type
if (homeType) {
  const selectedTypes = Array.isArray(homeType)
    ? homeType
    : homeType.split(",");
  query.homeType = { $in: selectedTypes };
}


// ------------------ FETCH HOMES FIRST ------------------
const homes = await Home.find(query).lean();   // <----- THIS was missing

// ------------------ IF NO DATES PROVIDED ------------------
if (!checkIn || !checkOut) {
  return res.render("search-results", {
    home: homes,
    filters: req.query,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    pageTitle: "Filtered Homes List",
  });
}

// ------------------ DATE PARSE ------------------
const checkInDate = new Date(checkIn);
const checkOutDate = new Date(checkOut);

// ------------------ FIND OVERLAPPING BOOKINGS ------------------
const overlappingBookings = await Booking.find({
  status: "booked",
  checkIn: { $lt: checkOutDate },
  checkOut: { $gt: checkInDate }
}).select("homeId");

// ------------------ EXTRACT BOOKED HOME IDS ------------------
const bookedHomeIds = overlappingBookings
  .filter(b => b?.homeId)
  .map(b => b.homeId.toString());

// ------------------ FILTER AVAILABLE HOMES ------------------
const availableHomes = homes.filter(h =>        // <-- "homes" used, not "home"
  !bookedHomeIds.includes(h._id.toString())
);

// ------------------ RETURN RESPONSE ------------------
return res.render("search-results", {
  home: availableHomes,
  filters: req.query,
  isLoggedIn: req.isLoggedIn,
  user: req.session.user,
  pageTitle: "Filtered Home List",
});


  } catch (err) {
    console.error(err);
    res.send("Error fetching hotels");
  }
};

  


exports.getBookings=(req, res, next) => {
  const homeId = req.params.homeId;
  //  console.log(homeId);
    Home.findById(homeId).then((home) => {
      const host=home.usersId;
      User.findById(host).then((users) => {
      // console.log(users);
    
  
  res.render("store/bookings", {
      isLoggedIn:req.isLoggedIn,
      home:home,
      user:req.session,
      users:users,
    pageTitle: "My Bookings",
    // currentPage: "bookings",
  });
}

    )
      })
}



exports.postBookings = async(req, res, next) => {
  
try {
    const homeId = req.params.homeId;
    const home = await Home.findById(homeId); // ✅ fetch the home first
    if (!home) return res.status(404).send('Home not found');
    console.log("💰 Price per night:", home.price);
console.log("📅 Check-in:", req.body.checkIn);
console.log("📅 Check-out:", req.body.checkOut);

 // check availability first
  const overlap = await Booking.findOne({
    homeId: home,
    status: "booked",
    checkIn: { $lt: new Date(req.body.checkOut) },
    checkOut: { $gt: new Date(req.body.checkIn) }
    
  }
);
  // console.log(overlap);

  if (overlap) {
    return res.status(400).json({ message: "Room not available" });
  }

    const booking = new Booking({
      homeId: home._id,
      guestId: req.session.user._id,
      hostId: home.usersId, // assuming you stored host/userId when adding home
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      numGuests: req.body.numGuests,
      status: "booked",
      totalAmount:   calcTotal(home.price, req.body.checkIn, req.body.checkOut,req.body.numGuests,)
    });

    await booking.save();
    console.log(booking);
    console.log('Booking saved successfully');
    res.redirect('/bookingList');
  } catch (err) {
    console.error('Error while booking:', err);
    res.status(500).send('Booking failed');
  }

}
function calcTotal(price, checkIn, checkOut,numGuests) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  
  // calculate difference in days
  const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));

  if (isNaN(nights) || nights <= 0) return 0;

  return price * nights * numGuests;
}



exports.getBookingList=(req, res, next) => {
 
  //  console.log(homeId);
    const guestId= req.session.user._id;
    Booking.find({guestId : guestId}).then((registeredHomes) => {
    res.render('store/bookingList', {
      registeredHomes: registeredHomes,
      isLoggedIn:req.isLoggedIn,
      user:req.session.user,
      pageTitle: "Your Booking List",
     
    });
  });

    }


   

exports.getFavouriteList =async (req, res, next) => {
  // Favourite.find()
  const userId= req.session.user._id;
  const user=await User.findById(userId).populate('favourites');
    res.render("store/favourite-list", {
      // registeredHomes: registeredHomes,
      isLoggedIn: req.isLoggedIn,
      favouriteHomes: user.favourites,
      user: req.session.user,
      pageTitle: "My Favourites",
      // currentPage: "favourites",
    });
  }
// );
// };

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId= req.session.user._id;
  // console.log(homeId);
  const user= await User.findById(userId);
  if(!user.favourites.includes(homeId)){
  user.favourites.push(homeId);
  await user.save();
}
    res.redirect("/favourites");
};

exports.postRemoveFromFavourite = async(req, res, next) => {
  const homeId = req.params.homeId;
  const userId= req.session.user._id;
  const user=await User.findById(userId);
if(user.favourites.includes(homeId)){
  user.favourites= user.favourites.filter(fav=>fav!=homeId);
  await user.save();
}
   res.redirect("/favourites");

};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-details", {
        isLoggedIn:req.isLoggedIn,
        home: home,
        user:req.session.user,
        pageTitle: "Home Detail",
        // currentPage: "Home",
      });
    }
  });
};


exports.getFooterPage = (req, res) =>  {
  const page = req.params.page 
  res.render("footer",{ page,isLoggedIn:req.isLoggedIn,
        user:req.session.user ,
     pageTitle: "Info", });
};
