


const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({
  name:{
    type:String,
    required:true,
  },

  city:{
    type:String,
    required: true,
   },

   price: {
    type: Number,
    required: true,
  },
  imageURL:
  {type: String },

  description:
  {type: String ,
    required: true
  },
  availableFrom: Date,
  availableGuests: Number,
  amenities: [String],
  usersId:{
 type:mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  


});

module.exports= mongoose.model('Home', homeSchema)
