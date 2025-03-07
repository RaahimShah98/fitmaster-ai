// pages/user-settings.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '@/context/FirebaseContext';


interface UserSettingsProps {
  email:string
}



const UserSettings: React.FC<UserSettingsProps> = ({email}) => {
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    weight: 75,
    height: 180,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation would go here
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
        {/* Background stars/particles */}
        {/* <div className="absolute inset-0 opacity-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white w-1 h-1"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div> */}

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
              <div className= "flex flex-row justify-between items-center flex-wrap">
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-l-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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

                {/* Current Password */}
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium mb-1 text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1 text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
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
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
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