import axios from "axios";
import { useEffect, useState } from "react";
import { serverurl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentShops } from "../pages/redux/UserSlice";

const Usegetshopbycity = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentcity } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentcity) {
      dispatch(setCurrentShops([]));
      setLoading(false);
      return;
    }

    const fetchShopbycity = async () => {
      try {
        setLoading(true);
        const result = await axios.get(`${serverurl}/shop/getshopbycity/${currentcity}`, {
          withCredentials: true,
        });
        if (result.data.success) {
          dispatch(setCurrentShops(result.data.shops));
        }
      } catch (err) {
        console.log("No shop found or error:", err?.response?.data || err.message || err?.response?.status);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopbycity();
  }, [currentcity, dispatch]);

  return { loading, error };
};

export default Usegetshopbycity;
