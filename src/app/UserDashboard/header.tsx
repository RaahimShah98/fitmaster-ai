import { useState } from "react";
import { useAuth } from "@/context/FirebaseContext";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    // console.log("IN HEADER: ", user);
    const DropDownItems = ["Profile", "Settings", "Logout"];

    return (
        <div className='w-full h-20 bg-blue-500 text-white flex items-center justify-between px-4'>
            <div className="Logo">Logo</div>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    <img
                        src="data:image/png;base64,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"
                        className="w-6 h-6 rounded-full mr-[10px]" alt="User"
                    />
                    {user?.email}
                </button>
                {isOpen && (
                    <div className="absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                        <ul className="py-2 text-sm text-gray-700">
                            {DropDownItems.map((item) => (
                                <li key={item} className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => item === "Logout" && logout()}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
