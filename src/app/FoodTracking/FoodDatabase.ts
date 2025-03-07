import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";

const getFoodItems = async (foodList: string[]) => {

    console.log("LIST: ", foodList);

    const foodData = await Promise.all(
        foodList.map(async (food, index) => {
            console.log(food);
            const foodRef = doc(db, "food-database", food.label);
            const foodSnap = await getDoc(foodRef);
            if (foodSnap.exists()) {
                console.log("FOOD SNAP: ", foodSnap.data());
                return { id: index, ...foodSnap.data() };
            } else {
                console.log(`No data found for ${food}`);
                return null;
            }
        })
    );
    console.log("DATA: "    , foodData);


    return foodData.filter(item => item !== null); // Remove null values
};

export default getFoodItems;
