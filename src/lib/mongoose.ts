import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// We maintain a cached connection across hot reloads in development.
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI is not defined in .env.local! Using in-memory fallback for now.");
    return null; // Return null gracefully so app doesn't crash without URI.
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ Successfully connected to MongoDB.");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
