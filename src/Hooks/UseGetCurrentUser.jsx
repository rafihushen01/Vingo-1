import axios from 'axios'
import React, { useEffect } from 'react'
import { serverurl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../pages/redux/UserSlice'

const UseGetCurrentUser = () => {
  const dispatch = useDispatch() // ✅ এখানে রাখবে

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const result = await axios.get(`${serverurl}/user/getcurrent`, {
          withCredentials: true
        })

        dispatch(setUserData(result.data)) // ✅ এখন কাজ করবে
      } catch (error) {
        console.log(error?.response?.data || error.message)
      }
    }

    fetchuser()
  }, [dispatch])
}

export default UseGetCurrentUser
