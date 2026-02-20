import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { serverurl } from "../App";
import { setUserData } from "../pages/redux/UserSlice";

const UseGetCurrentUser = () => {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchuser = async () => {
      try {
        const token = localStorage.getItem("vingo_auth_token");
        const result = await axios.get(`${serverurl}/user/getcurrent`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (result?.data?.success && result?.data?.User?.id) {
          dispatch(setUserData(result.data));
        } else {
          dispatch(setUserData(null));
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          dispatch(setUserData(null));
        } else {
          console.log(error?.response?.data || error.message);
        }
      } finally {
        if (active) {
          setAuthChecked(true);
        }
      }
    };

    fetchuser();

    return () => {
      active = false;
    };
  }, [dispatch]);

  return authChecked;
};

export default UseGetCurrentUser;
