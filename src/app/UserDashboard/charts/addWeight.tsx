"use client";
import React, { useEffect, useState } from "react";

import { X } from "lucide-react";

import { db } from "@/lib/firebase";
import { setDoc, doc } from "firebase/firestore";

interface addUserWeight {
    email: string;
    close: (close: boolean) => void;

}

const AddWeight: React.FC<addUserWeight> = ({ email, close }) => {
    const [currentWeight, setCurrentWeight] = useState<number>(0)
    const [alert, setAlert] = useState<boolean>(false)
    const [confirm, setConfirm] = useState<boolean>(false)

    const getFormattedDateTime = (): string => {
        const now = new Date();

        // Get day, month, and year
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = now.getFullYear();

        // Get total minutes passed since midnight
        const totalMinutes = now.getHours() * 60 + now.getMinutes();

        return `${day}-${month}-${year}`;
    };

    const updateWeight = async () => {
        if (!email) return
        if (currentWeight == 0) {
            setAlert(true)
            return
        }

        setAlert(false)
        try {
            const postRef = doc(db, "user_weight_tracking", email, "weights", getFormattedDateTime())

            await setDoc(postRef, { weight: currentWeight })
            setConfirm(true)

            setTimeout(() => {
                close(false)
            }, 1000);

        }
        catch (e) {
            console.log(e.message)
        }
    }

    return (
        <section className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 min-w-screen">
            <div className="flex flex-col w-full max-w-sm md:w-[30%] h-auto md:h-[50%] rounded-lg p-6 bg-gray-900 text-white relative">

                {/* Close Button */}
                <button
                    onClick={() => close(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition cursor-pointer "
                >
                    <X size={24} />
                </button>

                {/* Alert Message */}


                <div className="flex flex-col">
                    <h2 className="text-2xl font-semibold mb-5">Add Weight</h2>
                    {alert && (
                        <div className="bg-red-700 p-2 rounded-lg mb-4">
                            <p>You haven't entered your Weight</p>
                        </div>
                    )}
                    {confirm && (
                        <div className="bg-green-700 p-2 rounded-lg mb-4">
                            <p>Weight Added Successfully</p>
                        </div>
                    )}

                    {/* Input Field */}
                    <div className="flex items-center space-x-2">
                        <input
                            onChange={(e) => setCurrentWeight(e.target.value)}
                            type="number"
                            placeholder="Enter weight"
                            className="bg-black p-2 rounded-lg text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-white">Kgs</span>
                    </div>

                    {/* Add Weight Button */}
                    <button
                        onClick={() => updateWeight()}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Add Weight
                    </button>
                </div>
            </div>
        </section>

    );
};

export default AddWeight;
