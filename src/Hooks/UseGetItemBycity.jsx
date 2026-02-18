import axios from "axios";
import { useEffect, useState } from "react";
import { serverurl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentitems } from "../pages/redux/UserSlice";

const Usegetitembycity = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentcity } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentcity) {
      dispatch(setCurrentitems([]));
      setLoading(false);
      return;
    }

    const fetchitembycity = async () => {
      try {
        setLoading(true);
        const result = await axios.get(`${serverurl}/item/getitembycity/${currentcity}`, {
          withCredentials: true,
        });
        if (result.data.success) {
          dispatch(setCurrentitems(result.data.items));
        }
      } catch (err) {
        console.log("No item found or error:", err?.response?.data || err.message || err?.response?.status);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchitembycity();
  }, [currentcity, dispatch]);

  return { loading, error };
};

export default Usegetitembycity;
