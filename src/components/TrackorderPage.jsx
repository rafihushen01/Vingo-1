import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { serverurl } from '../App';
import { useParams } from 'react-router-dom';

const TrackorderPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${serverurl}/order/getorderbyid/${orderId}`, { withCredentials: true });
      if(res.data.success){
       <h1>TRACKORDER IS WORKING</h1>

        setOrder(res?.data?.order)
      }
    } 
    
    
    
    
    
    catch (err) {
        console.log(err?.response?.message ||err?.response?.data)
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  

  return (
     <div>
    <h1>Trackorder page</h1>
      


     </div>
  );
};

export default TrackorderPage;
