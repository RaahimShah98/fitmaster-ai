// pages/user-settings.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { db } from '@/lib/firebase';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/FirebaseContext';

interface UserSettingsProps {
  email: string
}

const UserSettings: React.FC<UserSettingsProps> = ({ email }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    weight: 0,
    height: 0,
    lastUpdate: new Date().toLocaleDateString(),
    RegisterDate: "",
    dob: "",
    Role: "user",
    status: "",
    subscription: "",
    weight_goal: "",
  });
  const [newFormData, setNewFormData] = useState({
    fullName: '',
    weight: 0,
    height: 0,
    lastUpdate: new Date().toLocaleDateString(),
    RegisterDate: "",
    dob: "",
    Role: "user",
    status: "",
    subscription: "",
    weight_goal: "",
  });

  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [newPassword, setNewPassowrd] = useState("")
  const [confirmPassword, setConfirmPassowrd] = useState("")
  const [saved, setSaved] = useState(false);
  const { updateUserPassword } = useAuth()

  // Handle Input change in form  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setSaved(false);
  };

  // Fetch user Details from Database
  const getUserData = async () => {
    const postRef = doc(db, "user", email)
    const querySnapShot = await getDoc(postRef)

    const userData = querySnapShot.data()
    console.log("USER DATA : ", userData)
    const form = {
      fullName: userData?.fullName ?? "",
      weight: userData?.weight ?? 0,
      height: userData?.height ?? 0,
      lastUpdate: new Date().toLocaleDateString(),
      RegisterDate: userData?.RegisterDate,
      dob: userData?.dob,
      Role: "user",
      status: userData?.status,
      subscription: userData?.subscription,
      weight_goal: userData?.weight_goal
    }

    setFormData(form)
  }

  useEffect(() => {
    getUserData()
  }, [])
  useEffect(() => {
    setNewFormData(formData)

  }, [formData])

  //Update user Weight
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

  const updateUserWeight = async () => {
    const postRef = doc(db, "user_weight_tracking", email, "weights", getFormattedDateTime());
    await setDoc(postRef, { weight: Number(formData.weight) }, { merge: true })

  }

  //Update User Details
  const updateUserDetails = async () => {
    console.log("called")
    const postRef = doc(db, "user", email)
    const querySnapShot = await setDoc(postRef, newFormData)
    updateUserWeight()
    alert("UPDATED")
    console.log(querySnapShot)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation would go here
    if (newPassword.length > 0) {
      if (newPassword.length < 8) {
        alert("Password length must be > 8")
        return
      }
      if (confirmPassword != newPassword) {
        alert("Password donot match")
        return
      }
      const response = await updateUserPassword(newPassword)
      console.log("RESPONSE: ", response)
    }
    if (formData.weight == 0 || formData.height == 0) {
      alert("Weight and Height cannot be 0")
      return
    }
    if (formData.weight < 0 || formData.height < 0) {
      alert("Weight and Height cannot be negative")
      return
    }
    if (formData.weight > 500 || formData.height > 300) {
      alert("Weight and Height cannot be more than 500 and 300 respectively")
      return
    }
    if (JSON.stringify(formData) == JSON.stringify(newFormData)) {
      alert("No changes made")
      return
    }

    updateUserDetails()

    console.log('Saving user settings:', formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Head>
        <title>User Settings | Fitness Evolution</title>
        <meta name="description" content="Manage your fitness profile settings" />
      </Head>

      <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">


        <div className="min-[75%] mx-auto relative z-10">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            User Settings
          </h1>

          <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 backdrop-blur-sm border border-gray-800">
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium mb-1 text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium mb-1 text-gray-300">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={email}
                  readOnly
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* Weight with unit toggle */}
              <div className="flex flex-row justify-between items-center flex-wrap">
                <div className="mb-4 w-[46%]">
                  <label htmlFor="weight" className="block text-sm font-medium mb-1 text-gray-300">
                    Weight
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      onWheel={(e) => e.preventDefault()}  // Prevent scrolling from changing the value
                      className="w-full bg-gray-800 border border-gray-700 rounded-l-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none -moz-appearance-none"
                    />
                    <div className="inline-flex">
                      <button
                        type="button"
                        className={`px-3 py-2 border border-gray-700 ${weightUnit === 'kg' ? 'bg-purple-600' : 'bg-gray-800'}`}
                        onClick={() => setWeightUnit('kg')}
                      >
                        kg
                      </button>

                    </div>
                  </div>
                </div>

                {/* Height with unit toggle */}
                <div className="mb-4 w-[46%]">
                  <label htmlFor="height" className="block text-sm font-medium mb-1 text-gray-300">
                    Height
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-l-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="inline-flex">
                      <button
                        type="button"
                        className={`px-3 py-2 border border-gray-700 ${heightUnit === 'cm' ? 'bg-purple-600' : 'bg-gray-800'}`}
                        onClick={() => setHeightUnit('cm')}
                      >
                        cm
                      </button>

                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6 mt-6">
                <h2 className="text-xl mb-4 text-purple-400">Change Password</h2>

                {/* New Password */}
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1 text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassowrd(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Confirm New Password */}
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassowrd(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-purple-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              >
                Save Changes
              </button>

              {/* Success message */}
              {saved && (
                <div className="mt-4 text-center text-green-400 bg-green-900 bg-opacity-30 rounded-md p-2">
                  Settings saved successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSettings;