import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverurl } from '../App'
import { useDispatch } from 'react-redux'

import { setMyorders } from '../pages/redux/UserSlice'

const UseGetOrders = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const result = await axios.get(`${serverurl}/order/userorders`, {
          withCredentials: true,
        })
        if (result.data.success) {
          dispatch(setMyorders(result.data.orders))
         console.log(result.data)
        }
      } catch (err) {
        console.log("❌ No Order found error:", err?.response?.data || err.message)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

   fetchOrders()
  }, [dispatch])

  return { loading, error }  // optional: hook থেকে state return করা
}

export default UseGetOrders
