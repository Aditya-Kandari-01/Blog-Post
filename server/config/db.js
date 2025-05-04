const mongoose = require('mongoose');
const connectionDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.mongoose_uri);
        console.log(`Database Connected : ${conn.connection.host}`);
    }
    catch (error) {
        console.log(error);
    }
} 

module.exports = connectionDB;