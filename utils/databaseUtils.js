
const mongo = require('mongodb');
const MongoClient =mongo.MongoClient;

const Mongo_url="mongodb+srv://ayushranjan6976:AyushRanjan@completecoding.g6cwx3l.mongodb.net/?retryWrites=true&w=majority&appName=CompleteCoding";

let _db;
const mongoConnect= (callback)=>{
  MongoClient.connect(Mongo_url).then(client=>{
  console.log(client);
  callback(client);
  _db=client.db('airbnb');
}).catch(err=>{
  console.log('Error while connecting to Mongo',err);
});
}
const getDb= ()=>{
  if(!-db){
    throw new Error('Mongo not connected');
  }
  return  _db;
}

exports.mongoConnect=mongoConnect;
exports.getDB = getDb;