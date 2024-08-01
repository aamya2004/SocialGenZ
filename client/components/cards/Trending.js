import { useEffect, useState } from "react"
import styles from "/components/cards/Trending.module.css"
import axios from "axios";
const Trending = () => {

  const [trending, setTrending] = useState(null);
  useEffect(() => {
    fetchTrending();
  
  }, [])
  
  const fetchTrending = async () => {
  //   const options = {
  //     method: 'GET',
  //     url: 'https://twitter-trends-by-location.p.rapidapi.com/location/f719fcd7bc333af4b3d78d0e65893e5e',
  //     headers: {
  //       'x-rapidapi-key': '0828f347fbmsh859b358cf670f31p15d8f7jsn0b48d05a7ebc',
  //       'x-rapidapi-host': 'twitter-trends-by-location.p.rapidapi.com'
  //     }
  //   };
    
  //   try {
  //     const response = await axios.request(options);
  //     console.log(response.data);
  //     setTrending(response.data.trending.trends);
  //   } catch (error) {
  //     console.error(error);
  //   }
        
   }

  return (
    <div className={`${styles.trendingSec}`}>
        <div>
        <h2>What's Trending?</h2>

    {
      trending && trending.slice(0, 10).map((trend, index) => (
        <div key={index} className={styles.trend}>
          <p>{trend.name}</p>
        </div>
      ))
    }
        </div>
    </div>
  )
}

export default Trending