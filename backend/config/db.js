require ('dotenv').config();
const mongoose = require ('mongoose');
async function ConnectMongo(){
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB!');
    }
    catch(error){
        console.log('Not connected to MongoDB!');
        console.log(error);
        process.exit(1); // Stop app if DB is unavailable; Prevent running a broken backend; 1: Abnormal termination
    }
}
module.exports = ConnectMongo;