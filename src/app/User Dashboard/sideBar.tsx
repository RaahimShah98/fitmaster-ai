import React, { useState } from "react";
// import Link from "next/link";

interface UserDashboardMenuProps {
  setSelectedPage: (page: string) => void;
}

const UserDashboardMenu: React.FC<UserDashboardMenuProps> = ({ setSelectedPage }) => {
  const sideBarItems = {
    Analytics: {
      imgsrc: "analytics-icon.svg",
      name: "Analytics",
    },
    Settings: {
      imgsrc: "settings-icon.svg",
      name: "Settings",
    },
    Goals: {
        imgsrc: "settings-icon.svg",
        name: "Goals",
      },
    Logout: {
      imgsrc: "logout-icon.svg",
      name: "Logout",
    },
    Login: {
      imgsrc: "logout-icon.svg",
      name: "Login",
    },
    SignUp: {
      imgsrc: "logout-icon.svg",
      name: "SignUp",
    },
  };

  return (
    <div className="w-[20%] bg-gray-200 h-screen sticky top-0 text-black flex flex-col items-start p-4">
      {Object.entries(sideBarItems).map(([key, item]) => (
        <button
          key={key}
          onClick={() => setSelectedPage(key)}
          className="w-full flex items-center p-3 hover:bg-gray-300 rounded-md focus:outline-none"
        >
          <img src={item.imgsrc} alt={item.name} className="w-6 h-6 mr-3" />
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default UserDashboardMenu;
