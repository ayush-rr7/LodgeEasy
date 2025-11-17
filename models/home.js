const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Home = require('./models/Home'); // update if path is different
const connectDB = require('./config/db'); // your DB connection

dotenv.config();
connectDB();

// Sample data
const cities = ['Manali', 'Goa', 'Shimla', 'Rishikesh', 'Coorg', 'Jaisalmer', 'Ooty', 'Darjeeling'];
const homeTypes = ['Villa', 'Apartment', 'Homestay', 'Bungalow', 'Guest House'];
const amenitiesList = ['WiFi', 'Parking', 'Pool', 'Kitchen', 'AC' ];

// Use these 3 user IDs randomly
const userIds = [
  '68b824b61028d8940f50d6b6',
  '6915826b3d677af715c1d13a',
  '69178b692e39d7b7b113dfce'
];

const generateHomes = (count = 40) => {
  const homes = [];
  for (let i = 1; i <= count; i++) {
    const name = `Home ${i} - ${cities[i % cities.length]}`;
    const city = cities[i % cities.length];
    const price = Math.floor(Math.random() * 5000) + 1000; // 1000-6000 INR
    const description = `A beautiful ${homeTypes[i % homeTypes.length]} in ${city} with all modern amenities.`;
    const maxGuests = Math.floor(Math.random() * 8) + 2; // 2-9 guests
    const homeType = homeTypes[i % homeTypes.length];
    
    // Pick 2-4 random amenities
    const amenities = amenitiesList
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 2);

    // Pick a random userId from the list
    const usersId = userIds[Math.floor(Math.random() * userIds.length)];

    const imageURL = `https://picsum.photos/400/300?random=${i}`; // random placeholder image

    homes.push({ name, city, price, description, maxGuests, homeType, amenities, usersId, imageURL });
  }
  return homes;
};

const seedData = async () => {
  try {
    // Do NOT delete existing data
    await Home.insertMany(generateHomes(40));
    console.log('✅  Homes seeded successfully with random data!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding homes:', error);
    process.exit(1);
  }
};

seedData();
