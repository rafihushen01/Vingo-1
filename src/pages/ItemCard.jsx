import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { motion } from "framer-motion"
import { Minus, Plus, Leaf, Drumstick } from "lucide-react"
import { serverurl } from "../App.jsx"
import {
  setCurrentitems,
  Addtocart,
  Updatquantity,
} from "../pages/redux/UserSlice.js"

const ItemCard = () => {

  const dispatch = useDispatch()
  const { currentcity, currentitems, cartitems } = useSelector(
    (state) => state.user
  )

  const [loading, setloading] = useState(false)

  // FETCH ITEMS
  useEffect(() => {
    const fetchitems = async () => {
      try {
        setloading(true)
        const { data } = await axios.get(
          `${serverurl}/item/getitembycity/${currentcity}`,
          { withCredentials: true }
        )
        dispatch(setCurrentitems(data.items))
      } catch (error) {
        console.log(error)
      } finally {
        setloading(false)
      }
    }

    if (currentcity) fetchitems()
  }, [currentcity, dispatch])

  // GET QUANTITY
  const getquantity = (id) => {
    const item = cartitems.find((i) => i.id === id)
    return item ? item.quantity : 0
  }

  // PLUS
  const handleplus = (item) => {
    const existing = cartitems.find((i) => i.id === item._id)
    if (existing) {
      dispatch(
        Updatquantity({
          id: item._id,
          quantity: existing.quantity + 1,
        })
      )
    } else {
      dispatch(
        Addtocart({
          id: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: 1,
        })
      )
    }
  }

  // MINUS
  const handleminus = (item) => {
    const existing = cartitems.find((i) => i.id === item._id)
    if (existing && existing.quantity > 1) {
      dispatch(
        Updatquantity({
          id: item._id,
          quantity: existing.quantity - 1,
        })
      )
    }
  }

  // MANUAL INPUT
  const handleinput = (item, value) => {
    if (value === "") return
    const quantity = Number(value)
    if (quantity < 1) return
    const existing = cartitems.find((i) => i.id === item._id)
    if (existing) {
      dispatch(
        Updatquantity({
          id: item._id,
          quantity,
        })
      )
    } else {
      dispatch(
        Addtocart({
          id: item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity,
        })
      )
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  return (
    <div className="px-6 py-10">

      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center mb-12"
      >
        Best Items in  <span className="text-orange-600">{currentcity}</span>
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

        {currentitems &&
          currentitems.map((item) => {
            const quantity = getquantity(item._id)

            return (
              <motion.div
                key={item._id}
                whileHover={{ scale: 1.04 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden group"
              >
                {/* IMAGE */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  {/* FOOD TYPE ICON */}
                  <div className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-lg">
                    {item.foodtype === "veg" ? (
                      <Leaf className="text-green-600" size={18} />
                    ) : (
                      <Drumstick className="text-red-600" size={18} />
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 space-y-4">
                  <h2 className="text-xl font-bold">{item.name}</h2>
                  <p className="text-gray-500 text-sm">{item.category}</p>

                  {/* QUANTITY CONTROLLER */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      ৳ {item.price}
                    </span>

                    <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 gap-2">
                      <button
                        onClick={() => handleminus(item)}
                        className="p-1 hover:bg-red-100 rounded-full cursor-pointer transition"
                      >
                        <Minus size={18} />
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={quantity || ""}
                        onChange={(e) => handleinput(item, e.target.value)}
                        className="w-12 text-center bg-transparent outline-none"
                      />

                      <button
                        onClick={() => handleplus(item)}
                        className="p-1 hover:bg-green-100 rounded-full cursor-pointer transition"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* 🔥 ADD TO CART BUTTON */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                  
                    className="w-full bg-black text-white py-3 rounded-2xl mt-3 hover:bg-gray-900 transition cursor-pointer font-semibold"
                  >
                    Add To Cart
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
      </div>
    </div>
  )
}

export default ItemCard