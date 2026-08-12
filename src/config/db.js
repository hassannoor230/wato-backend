import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL: MONGODB_URI is missing from environment variables.');
    console.error('Please set MONGODB_URI in your .env file.');
    process.exit(1);
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  try {
    console.log('Attempting MongoDB connection...');
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('FATAL: MongoDB connection failed.');
    console.error('Possible causes:');
    console.error('1. MongoDB Atlas IP is not whitelisted');
    console.error('2. Invalid MongoDB credentials');
    console.error('3. Incorrect MONGODB_URI format');
    console.error('4. Atlas cluster is paused/unavailable');
    console.error('5. DNS/network connectivity issue');
    console.error('6. Firewall/VPN blocking outbound MongoDB traffic');
    console.error('');
    console.error('Error details:', err.message);
    console.error('Error code:', err.code);
    console.error('Error name:', err.name);
    process.exit(1);
  }
}
