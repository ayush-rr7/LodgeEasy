const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
  homeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  numGuests:{ type:Number, required:true},
  totalAmount: { type: Number, required: true },
   status: {
    type: String,
    enum: ["booked", "cancelled"],
    default: "booked",
  }
  // bookingDate: { type: Date, default: Date.now }
});

  



module.exports= mongoose.model('Booking', bookingSchema);
