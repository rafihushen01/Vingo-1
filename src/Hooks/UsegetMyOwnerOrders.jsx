import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverurl } from '../App'
import { useDispatch } from 'react-redux'
import { setownerorders } from '../pages/redux/OwnerSlice'


const UseGetownerOrders = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchownerorders = async () => {
      try {
        setLoading(true)
        const result = await axios.get(`${serverurl}/order/ownerorders`, {
          withCredentials: true,
        })
        if (result.data.success) {
          const dispatchdata=   dispatch(setownerorders(result.data.orders))
          
           console.log(result.data)
           console.log(dispatchdata)
        }
      } catch (err) {
        console.log("❌ No Order found error:", err?.response?.data || err.message)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchownerorders()
  }, [dispatch])

  return { loading, error }  // optional: hook থেকে state return করা
}

export default UseGetownerOrders
