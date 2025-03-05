const mongoose = require('mongoose');

class MongoDB {
  constructor() {
    if (MongoDB.instance) {
      return MongoDB.instance;
    }

    MongoDB.instance = this;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('MongoDB is already connected.');
      return;
    }

    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.isConnected = true;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error While connecting MongoDB: ${error.message}`);
      process.exit(1);
    }
  }
}

module.exports = new MongoDB();
