import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverurl } from '../App'
import { useDispatch, useSelector } from 'react-redux'

import { setCurrentitems } from '../pages/redux/UserSlice'

const Usegetitembycity = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const {currentcity}=useSelector((state)=>state.user)

  useEffect(() => {
    const fetchitembycity = async () => {
      try {
        setLoading(true)
        const result = await axios.get(`${serverurl}/item/getitembycity/${currentcity}`, {
          withCredentials: true,
        })
        if (result.data.success) {
         
          console.log(result.data.items)
          dispatch(setCurrentitems(result.data.items))
        }
      } catch (err) {
        console.log("❌ No shop found or error:", err?.response?.data || err.message ||err?.response?.status)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchitembycity()
  }, [currentcity])

  return { loading, error }  // optional: hook থেকে state return করা
}

export default Usegetitembycity
