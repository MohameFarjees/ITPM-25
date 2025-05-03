import React from "react";
import { assets } from "../assets/assets";

const ProfilePage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-md transform transition-all duration-500 hover:scale-105">
        {/* Profile Header */}
        <div className="bg-blue-600 p-6 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white mx-auto shadow-lg">
            <img
              src={assets.man}
              alt="Profile Picture"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">Farjees</h1>
          <p className="text-sm text-blue-200">
            E-commerce Enthusiast | Full-Stack Developer
          </p>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-gray-600 w-20">Email:</span>
              <span className="text-gray-900 font-medium">
                mohamedfarjees01@gmail.com
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-20">Phone:</span>
              <span className="text-gray-900 font-medium">+94764854578</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-20">Address:</span>
              <span className="text-gray-900 font-medium">
                54, Main Street, Maligaikadu
              </span>
            </div>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="bg-gray-50 p-6 flex justify-between">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300">
            Edit Profile
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;