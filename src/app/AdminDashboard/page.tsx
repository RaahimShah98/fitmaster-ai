// pages/admin/dashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, collection, getDocs, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/FirebaseContext";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import {
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import FloatingNav from "@/components/FloatingNav";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Define types for our data
type User = {
  fullName: string;
  email: string;
  dob: string;
  weight: string;
  height: string;
  weight_goal: string;
  Role: string;
  RegisterDate: string;
  workoutsCompleted: number;
  subscriptionType: "Free" | "Premium" | "Enterprise";
  status: "Active" | "Inactive" | "Suspended";
  progress: number;
};

type ModelUsage = {
  date: string;
  userCount: number;
  apiCalls: number;
  processingTime: number;
};

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setfilteredUsers] = useState<User[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<number[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Get user auth context
  const { user } = useAuth();
  const router = useRouter();
  const email = user?.email;

  // Check if user is admin immediately on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !email) {
        // No user logged in, redirect
        router.push("/");
        return;
      }

      try {
        const userDoc = doc(db, "user", email);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.Role !== "admin") {
            // User exists but is not admin, redirect
            router.push("/");
            return;
          } else {
            // User is admin, set state to continue rendering
            setIsAdmin(true);
            // Now fetch the data since we know user is admin
            const data = await getDocData();
            setUsers(data);
          }
        } else {
          // User document doesn't exist, redirect
          router.push("/");
          return;
        }
      } catch (e) {
        console.error("Error checking admin status:", e);
        // On error, redirect to be safe
        router.push("/");
      }
    };

    checkAdminStatus();
  }, [email, user, router]);

  // Function to get user data
  const getDocData = async (): Promise<User[]> => {
    const userData = await getDocs(collection(db, "user"));
    const data = userData.docs.map((doc) => doc.data() as User);
    console.log("DATA: ", data);
    return data;
  };

  // Process users data
  useEffect(() => {
    if (users.length > 0) {
      setfilteredUsers(
        users.filter(
          (user) =>
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

      const labels = ["Free", "Premium", "Enterprise"];
      const newSubscriptionData = labels.map(
        (label) =>
          users.filter((user) => user.subscriptionType === label).length
      );
      setSubscriptionData(newSubscriptionData);

      let totalWorkouts = 0;
      users.forEach((item) => {
        if (item.workoutsCompleted != null) {
          totalWorkouts += item.workoutsCompleted;
        }
      });
      setTotalWorkouts(totalWorkouts);
    }
  }, [users, searchQuery]);

  // Filter Users based on search
  useEffect(() => {
    setfilteredUsers(
      users.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  // Mock data for model usage
  const modelUsageData: ModelUsage[] = [
    {
      date: "2025-02-25",
      userCount: 1250,
      apiCalls: 18500,
      processingTime: 340,
    },
    {
      date: "2025-02-26",
      userCount: 1290,
      apiCalls: 19200,
      processingTime: 355,
    },
    {
      date: "2025-02-27",
      userCount: 1310,
      apiCalls: 20100,
      processingTime: 362,
    },
    {
      date: "2025-02-28",
      userCount: 1340,
      apiCalls: 19800,
      processingTime: 348,
    },
    {
      date: "2025-03-01",
      userCount: 1420,
      apiCalls: 21500,
      processingTime: 375,
    },
    {
      date: "2025-03-02",
      userCount: 1480,
      apiCalls: 22300,
      processingTime: 389,
    },
    {
      date: "2025-03-03",
      userCount: 1510,
      apiCalls: 23100,
      processingTime: 396,
    },
  ];

  // Chart data
  const userProgressChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Active Users",
        data: [850, 960, 1100, 1250, 1380, 1450, 1510],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const workoutCompletionChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Workouts Completed",
        data: [540, 620, 580, 630, 750, 890, 720],
        backgroundColor: "#8b5cf6",
      },
    ],
  };

  const subscriptionDistributionData = {
    labels: ["Free", "Premium", "Enterprise"],
    datasets: [
      {
        data: subscriptionData,
        backgroundColor: ["#8b5cf6", "#6366f1", "#4f46e5"],
        borderWidth: 0,
      },
    ],
  };

  // CRUD operations
  const addUser = (user: Omit<User, "id">) => {
    const newUser = {
      ...user,
      id: (users.length + 1).toString(),
    };
    setUsers([...users, newUser as User]);
    setIsModalOpen(false);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(
      users.map((user) =>
        user.email === updatedUser.email ? updatedUser : user
      )
    );
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const deleteUser = (email: string) => {
    setUsers(users.filter((user) => user.email !== email));
  };

  const openAddUserModal = () => {
    setModalMode("add");
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // If still checking admin status or redirecting, show nothing
  if (isAdmin === null) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Head>
        <title>Admin Dashboard | FitMaster AI</title>
      </Head>
      <FloatingNav></FloatingNav>

      {/* Sidebar - Mobile */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } fixed inset-0 z-40 lg:hidden`}
      >
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-gray-800 border-r border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center mr-2">
                <span className="text-white font-bold">F</span>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md bg-purple-700 text-white"
            >
              <UsersIcon className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <UsersIcon className="mr-3 h-5 w-5" />
              Users
            </Link>
            <Link
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <ChartBarIcon className="mr-3 h-5 w-5" />
              Analytics
            </Link>
            <Link
              href="#"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <CogIcon className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-700 bg-gray-800">
          <div className="flex items-center h-16 px-4 border-b border-gray-700">
            <div className="h-8 w-8 bg-purple-600 rounded-md flex items-center justify-center mr-2">
              <span className="text-white font-bold">F</span>
            </div>
            {/* <span className="text-xl font-semibold">FitMaster AI</span> */}
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              href="#"
              onClick={() => setCurrentTab("overview")}
              className={`flex items-center px-2 py-2 text-sm font-medium rounded ${
                currentTab === "overview"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <UsersIcon className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="#"
              onClick={() => setCurrentTab("users")}
              className={`flex items-center px-2 py-2 text-sm font-medium rounded ${
                currentTab === "users"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <UsersIcon className="mr-3 h-5 w-5" />
              Users
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-gray-800 border-b border-gray-700">
          {/* <FloatingNav></FloatingNav> */}
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentTab === "overview"
                    ? "bg-purple-700 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setCurrentTab("overview")}
              >
                Overview
              </button>
              <button
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentTab === "users"
                    ? "bg-purple-700 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setCurrentTab("users")}
              >
                Users
              </button>
            </div>
          </div>

          {/* Overview Tab Content */}
          {currentTab === "overview" && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-300">
                      Total Users
                    </h3>
                    <div className="h-10 w-10 rounded-full bg-purple-600 bg-opacity-25 flex items-center justify-center">
                      <UsersIcon className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">{users.length}</p>
                  <p className="text-sm text-green-400 mt-1">
                    ↑ 12% from last month
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-300">
                      Total Workouts
                    </h3>
                    <div className="h-10 w-10 rounded-full bg-indigo-600 bg-opacity-25 flex items-center justify-center">
                      <ChartBarIcon className="h-6 w-6 text-indigo-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">{totalWorkouts}</p>
                  <p className="text-sm text-green-400 mt-1">
                    ↑ 8% from last month
                  </p>
                </div>
                {/* <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-300">API Calls</h3>
                    <div className="h-10 w-10 rounded-full bg-blue-600 bg-opacity-25 flex items-center justify-center">
                      <CogIcon className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">23.1K</p>
                  <p className="text-sm text-green-400 mt-1">↑ 15% from yesterday</p>
                </div> */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-300">
                      Avg. Completion
                    </h3>
                    <div className="h-10 w-10 rounded-full bg-violet-600 bg-opacity-25 flex items-center justify-center">
                      <ChartBarIcon className="h-6 w-6 text-violet-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mt-2">78%</p>
                  <p className="text-sm text-green-400 mt-1">
                    ↑ 5% from last week
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">
                    User Growth
                  </h3>
                  <div className="h-72">
                    <Line
                      data={userProgressChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                            labels: {
                              color: "#e2e8f0",
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              color: "rgba(75, 85, 99, 0.2)",
                            },
                            ticks: {
                              color: "#e2e8f0",
                            },
                          },
                          y: {
                            grid: {
                              color: "rgba(75, 85, 99, 0.2)",
                            },
                            ticks: {
                              color: "#e2e8f0",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                {/* <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">Weekly Workouts</h3>
                  <div className="h-72">
                    <Bar
                      data={workoutCompletionChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: {
                              color: '#e2e8f0'
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              color: 'rgba(75, 85, 99, 0.2)'
                            },
                            ticks: {
                              color: '#e2e8f0'
                            }
                          },
                          y: {
                            grid: {
                              color: 'rgba(75, 85, 99, 0.2)'
                            },
                            ticks: {
                              color: '#e2e8f0'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div> */}
              </div>

              {/* Additional Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">
                    Subscription Distribution
                  </h3>
                  <div className="h-64 flex items-center justify-center">
                    <Doughnut
                      data={subscriptionDistributionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              color: "#e2e8f0",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 col-span-1 lg:col-span-2">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">
                    Recent User Activity
                  </h3>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            User
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Last Active
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {filteredUsers.map((user) => (
                          <tr key={user.email}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {user.fullName.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium">
                                    {user.fullName}
                                  </div>
                                  <div
                                    key={user.email}
                                    className="text-sm text-gray-400"
                                  >
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {user.status}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-purple-600 h-2.5 rounded-full"
                                  style={{ width: `${user.progress}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {user.progress}% Complete
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab Content */}
          {currentTab === "users" && (
            <div>
              <div className="relative ml-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-md flex items-center hover:bg-purple-700"
                  onClick={openAddUserModal}
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add User
                </button>
              </div>
              <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Join Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Subscription
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.email}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.fullName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">
                                {user.fullName}
                              </div>
                              <div
                                key={user.email}
                                className="text-sm text-gray-400"
                              >
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.RegisterDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.subscriptionType === "Premium"
                                ? "bg-purple-900 text-purple-200"
                                : user.subscriptionType === "Enterprise"
                                ? "bg-indigo-900 text-indigo-200"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {user.subscriptionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.status === "Active"
                                ? "bg-green-900 text-green-200"
                                : user.status === "Inactive"
                                ? "bg-yellow-900 text-yellow-200"
                                : "bg-red-900 text-red-200"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              className="p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => openEditUserModal(user)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => deleteUser(user.email)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Model Usage Tab Content */}
          {currentTab === "model" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  AI Model Usage Analytics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300 mb-4">
                      API Usage Over Time
                    </h3>
                    <div className="h-72">
                      <Line
                        data={{
                          labels: modelUsageData.map((data) => data.date),
                          datasets: [
                            {
                              label: "API Calls",
                              data: modelUsageData.map((data) => data.apiCalls),
                              borderColor: "#8b5cf6",
                              backgroundColor: "rgba(139, 92, 246, 0.5)",
                              tension: 0.4,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                              labels: { color: "#e2e8f0" },
                            },
                          },
                          scales: {
                            x: {
                              grid: { color: "rgba(75, 85, 99, 0.2)" },
                              ticks: { color: "#e2e8f0" },
                            },
                            y: {
                              grid: { color: "rgba(75, 85, 99, 0.2)" },
                              ticks: { color: "#e2e8f0" },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">
                    Processing Time
                  </h3>
                  <div className="h-72">
                    <Line
                      data={{
                        labels: modelUsageData.map((data) => data.date),
                        datasets: [
                          {
                            label: "Avg Processing Time (ms)",
                            data: modelUsageData.map(
                              (data) => data.processingTime
                            ),
                            borderColor: "#6366f1",
                            backgroundColor: "rgba(99, 102, 241, 0.5)",
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                            labels: { color: "#e2e8f0" },
                          },
                        },
                        scales: {
                          x: {
                            grid: { color: "rgba(75, 85, 99, 0.2)" },
                            ticks: { color: "#e2e8f0" },
                          },
                          y: {
                            grid: { color: "rgba(75, 85, 99, 0.2)" },
                            ticks: { color: "#e2e8f0" },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-300 mb-4">
                    Daily Active Users
                  </h3>
                  <div className="h-72">
                    <Line
                      data={{
                        labels: modelUsageData.map((data) => data.date),
                        datasets: [
                          {
                            label: "Daily Active Users",
                            data: modelUsageData.map((data) => data.userCount),
                            borderColor: "#4f46e5",
                            backgroundColor: "rgba(79, 70, 229, 0.5)",
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                            labels: { color: "#e2e8f0" },
                          },
                        },
                        scales: {
                          x: {
                            grid: { color: "rgba(75, 85, 99, 0.2)" },
                            ticks: { color: "#e2e8f0" },
                          },
                          y: {
                            grid: { color: "rgba(75, 85, 99, 0.2)" },
                            ticks: { color: "#e2e8f0" },
                            min: 0,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-300 mb-4">
                  Model Usage Details
                </h3>
                <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Active Users
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          API Calls
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Avg. Processing Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {modelUsageData.map((data, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {data.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {data.userCount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {data.apiCalls.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {data.processingTime} ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-100">
                  {modalMode === "add" ? "Add New User" : "Edit User"}
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      defaultValue={selectedUser?.name || ""}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      defaultValue={selectedUser?.email || ""}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subscription"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Subscription
                    </label>
                    <select
                      id="subscription"
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      defaultValue={selectedUser?.subscriptionType || "Free"}
                    >
                      <option value="Free">Free</option>
                      <option value="Premium">Premium</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      defaultValue={selectedUser?.status || "Active"}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {modalMode === "add" ? "Add User" : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
