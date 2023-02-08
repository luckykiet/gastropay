import { useEffect, useState } from "react";
import axios from "axios";

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState([]);
    useEffect(() => {
        axios
            .get("/database/restaurants.json")
            .then((res) => {
                setRestaurants(res.data);
            })
            .catch((err) => console.log(err));
    }, []);
    return (
        <div>
            <ul>
                {Object.keys(restaurants).map((item, i) => {
                    return <li key={item}>{restaurants[item].name}</li>;
                })}
            </ul>
        </div>
    );
}