import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverurl } from "../App";

const useupdatelocation = () => {
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
 // যদি ইউজার লগইন না করে থাকে, কিছু না করা

    const updatelocation = async (lat, lon) => {
      try {
        const result = await axios.post(
          `${serverurl}/user/updatelocation`,
          { lat, lon },
          { withCredentials: true }
        );

        if (result.data.success) {
          console.log("✅ Location updated:", result.data);

        }
      } catch (error) {
        console.log("❌ Location update failed:", error?.response?.data || error);
      }
    };

    // watchPosition সবসময় লোকেশন ট্র্যাক করবে
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updatelocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.log("❌ Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    // cleanup — যখন কম্পোনেন্ট আনমাউন্ট হবে
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userData]);
};

export default useupdatelocation;
