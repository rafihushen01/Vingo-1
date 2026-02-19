import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { serverurl } from "../App";
import { setUserData } from "../pages/redux/UserSlice";

const UseGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const result = await axios.get(`${serverurl}/user/getcurrent`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data));
      } catch (error) {
        if (error?.response?.status === 401) {
          dispatch(setUserData(null));
          return;
        }
        console.log(error?.response?.data || error.message);
      }
    };

    fetchuser();
  }, [dispatch]);
};

export default UseGetCurrentUser;
