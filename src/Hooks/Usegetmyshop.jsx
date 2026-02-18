import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverurl } from '../App'
import { useDispatch } from 'react-redux'
import { setShopData } from '../pages/redux/OwnerSlice'

const UseGetCurrentShop = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true)
        const result = await axios.get(`${serverurl}/shop/getmyshop`, {
          withCredentials: true,
        })
        if (result.data.success) {
          dispatch(setShopData(result.data.shop))
        }
      } catch (err) {
        console.log("❌ No shop found or error:", err?.response?.data || err.message)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchShop()
  }, [dispatch])

  return { loading, error }  // optional: hook থেকে state return করা
}

export default UseGetCurrentShop
