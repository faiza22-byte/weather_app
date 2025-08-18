// controllers/profileController.js
import User from "../models/user.js";

// ✅ Fetch user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id; // coming from route like /profile/:id

    const user = await User.findById(userId).select("-password"); 
    // exclude password field for security

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user)
    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: req.body }, // allows updating name, email, etc.
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
