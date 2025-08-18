import axios from "axios";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Decode JWT safely
const parseJwt = (token) => {
  try {
    const base64Payload = token.split(".")[1];
    const jsonPayload = atob(base64Payload);
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
};

export default function ProfilePanel() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load userId from localStorage
useEffect(() => {
  const userData = JSON.parse(localStorage.getItem("user"));
  console.log("📦 LocalStorage user:", userData); // <-- print full user object

  if (userData?.token) {
    const decoded = parseJwt(userData.token);
    console.log("🔑 Decoded JWT:", decoded); // <-- print decoded token payload

    const id = decoded?.id || userData._id;
    if (id) setUserId(id.trim()); // clean id
  } else {
    setLoading(false);
  }
}, []);


  // Fetch user profile (authoritative source)
  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/profile/${userId}`);
        setProfile(res.data); // full backend data
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) return <div className="p-3 text-black">Loading...</div>;
  if (!profile)
    return (
      <div className="p-3 text-black text-center">Profile not available</div>
    );

  return (
    <div className="p-3 bg-white shadow-lg rounded-lg w-64 text-black" style={{color:"black"}}>
      {/* Header with icon */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-gray-200 rounded-full">
          <User size={20} className="text-black" />
        </div>
        <h2 className="text-base font-semibold text-black">Profile</h2>
      </div>

      {/* Profile Info */}
      <div className="space-y-1 text-sm text-black">
        <p>
          <span style={{ fontSize:"20px"}}><strong>Name:</strong></span> {profile.name}
        </p>
        <p>
          <span style={{ fontSize:"20px"}}><strong>Email:</strong></span> {profile.email}
        </p>
        {profile.createdAt && (
          <p>
            <span style={{ fontSize:"20px"}}><strong>Created at :</strong></span>{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        )}
        {profile.updatedAt && (
          <p>
            <span style={{ fontSize:"20px"}}><strong>Last Updated:</strong></span>{" "}
            {new Date(profile.updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full mt-3 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
      >
        Logout
      </button>
    </div>
  );
}
