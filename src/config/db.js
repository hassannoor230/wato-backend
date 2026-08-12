import mongoose from 'mongoose';

let connecting = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return mongoose.connection;
  if (connecting) return connecting;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const err = new Error('MONGODB_URI is missing from environment variables.');
    console.error('FATAL: ' + err.message);
    console.error('Set MONGODB_URI in your .env file or Vercel project environment variables.');
    throw err;
  }

  if (!global.__mongooseListenersRegistered) {
    mongoose.connection.on('connected', () => console.log('MongoDB connected'));
    mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err.message));
    mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
    mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
    global.__mongooseListenersRegistered = true;
  }

  try {
    connecting = mongoose.connect(uri);
    await connecting;
    console.log('MongoDB connected successfully');
    return mongoose.connection;
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
    throw err;
  } finally {
    connecting = null;
  }
}
