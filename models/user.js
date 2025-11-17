
const mongoose = require('mongoose');
// const {ObjectId} =require('mongodb');

const userSchema = mongoose.Schema({
  firstName:{
    type:String,
    required:true,
  },
lastName:{
    type:String,
    // required:true,
  },
city :{
    type:String,
    required:true,
  },
email:{
    type:String,
    required:true,
  },
password:{
    type:String,
    required:true,
  },
  userType:{
    type:String,
    enum:['Guest','Host'],
    default: 'Guest'
  },
  emailVerified: { type: Boolean, default: true },
  // verifyToken: { type: String },
  // verifyTokenExpire: { type: Date },
   createdAt: { 
    type: Date, 
    default: Date.now 
  },
  favourites:[{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'Home'
  }]
  
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

