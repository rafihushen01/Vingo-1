import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverurl } from '../App'
import { useDispatch, useSelector } from 'react-redux'

import { setCurrentShops } from '../pages/redux/UserSlice'

const Usegetshopbycity = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const {currentcity}=useSelector((state)=>state.user)

  useEffect(() => {
    const fetchShopbycity = async () => {
      try {
        setLoading(true)
        const result = await axios.get(`${serverurl}/shop/getshopbycity/${currentcity}`, {
          withCredentials: true,
        })
        if (result.data.success) {
          dispatch(setCurrentShops(result.data.shops))
          console.log(result.data)
        }
      } catch (err) {
        console.log("❌ No shop found or error:", err?.response?.data || err.message ||err?.response?.status)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchShopbycity()
  }, [currentcity])

  return { loading, error }  // optional: hook থেকে state return করা
}

export default Usegetshopbycity
