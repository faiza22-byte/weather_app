
import mongoose from "mongoose";


const userLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user
    required: true,
    ref: "User"
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  frequency: {
    type: Number,
    default: 1
  },
  lastVisited: {
    type: Date,
    default: Date.now
  }
});

// Create a unique index for userId + lat + lng combination
userLocationSchema.index({ userId: 1, latitude: 1, longitude: 1 }, { unique: true });

const UserLocation = mongoose.model("UserLocation", userLocationSchema);
export default UserLocation;
