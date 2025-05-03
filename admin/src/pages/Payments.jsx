import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { Trash2, Download, CreditCard, Search, Filter, X } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [backgroundAnimation, setBackgroundAnimation] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch all orders from the backend
  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        const fetchedOrders = response.data.orders.reverse();
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
        setTimeout(() => setIsVisible(true), 100);
        setTimeout(() => setBackgroundAnimation(true), 300);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Status handler for updating payment status
  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    setLoading(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/order/payment",
        { orderId, payment: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        // Update the order status locally without refetching all orders
        setOrders(orders.map(order => 
          order._id === orderId ? {...order, payment: newStatus} : order
        ));
        toast.success(`Payment status updated to ${newStatus}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete an order with animation
  const deleteOrder = async (orderId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this payment? This action cannot be undone."
    );
    if (!isConfirmed) return;

    setLoading(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/order/delete",
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        // Remove the order locally with animation
        setOrders(orders.filter(order => order._id !== orderId));
        toast.success("Payment deleted successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate and download a report
  const generateReport = () => {
    // Cart animation for download button
    const button = document.querySelector('.download-btn');
    button.classList.add('animate-pulse');
    setTimeout(() => button.classList.remove('animate-pulse'), 1000);
    
    // Create CSV content
    const headers = [
      "Order ID",
      "Items",
      "Customer Name",
      "Address",
      "Phone",
      "Payment Method",
      "Payment Status",
      "Amount",
      "Date",
    ];
    const rows = orders.map((order) => [
      order._id,
      order.items.map((item) => `${item.name} x ${item.quantity}`).join(", "),
      `${order.address.firstName} ${order.address.lastName}`,
      `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`,
      order.address.phone,
      order.paymentMethod,
      order.payment,
      `${currency}${order.amount}`,
      new Date(order.date).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    // Create a temporary anchor element to trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payment_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search and filter function
  const handleSearchAndFilter = () => {
    let result = orders;

    // Filter by status
    if (filterStatus !== "All") {
      result = result.filter(order => order.payment === filterStatus);
    }

    // Search functionality
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(searchTermLower) ||
        `${order.address.firstName} ${order.address.lastName}`.toLowerCase().includes(searchTermLower) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTermLower)
        ) ||
        order.address.phone.includes(searchTermLower)
      );
    }

    setFilteredOrders(result);
  };

  // Useeffect for search and filter
  useEffect(() => {
    handleSearchAndFilter();
  }, [searchTerm, filterStatus, orders]);

  // Fetch orders when the component mounts or when the token changes
  useEffect(() => {
    fetchAllOrders();
    return () => {
      setIsVisible(false);
      setBackgroundAnimation(false);
    }; // Cleanup on unmount
  }, [token]);

  // Function to get the color based on payment status
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Advanced loading and empty state animations
  const LoadingSpinner = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="flex justify-center items-center h-64"
    >
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-200 rounded-full h-8 w-8 opacity-50"
        />
      </div>
    </motion.div>
  );

  // Search bar component with advanced animations
  const SearchBar = () => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full max-w-2xl mx-auto mb-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search orders by ID, name, items, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full p-3 pl-12 pr-16 rounded-xl border-2 transition-all duration-300 ${
                isFocused 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-300 hover:border-blue-300'
              } focus:outline-none`}
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
              <Search className={`w-6 h-6 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} />
            </motion.div>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-6 h-6 text-gray-500 hover:text-red-500" />
              </motion.button>
            )}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="ml-4 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Filter className="w-6 h-6 text-blue-500" />
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex justify-center space-x-4"
            >
              {['All', 'Pending', 'Paid', 'Cancelled'].map(status => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    filterStatus === status 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  {status}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Advanced pagination or lazy loading section
  const [visibleOrders, setVisibleOrders] = useState(5);
  const loadMoreOrders = () => {
    setVisibleOrders(prev => prev + 5);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const orderVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    },
    exit: { 
      x: "-100%", 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // Background animation variants
  const backgroundVariants = {
    hidden: { 
      opacity: 0,
      scale: 1.1
    },
    visible: { 
      opacity: 0.2,
      scale: 1,
      transition: { 
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  // Floating particles animation variants
  const particleVariants = {
    animate: (i) => ({
      y: [0, -15, 0],
      x: [0, i % 2 === 0 ? 10 : -10, 0],
      opacity: [0.3, 0.7, 0.3],
      transition: {
        duration: 3 + i,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  };

  // Generate random particles for background
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    size: Math.floor(Math.random() * 8) + 4,
    left: `${Math.floor(Math.random() * 95)}%`,
    top: `${Math.floor(Math.random() * 90)}%`,
    delay: Math.random() * 2
  }));

  return (
    <div className="p-4 relative overflow-hidden bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient circles */}
        <motion.div
          initial="hidden"
          animate={backgroundAnimation ? "visible" : "hidden"}
          variants={backgroundVariants}
          className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 -translate-y-1/4 translate-x-1/4 blur-3xl"
        />
        <motion.div
          initial="hidden"
          animate={backgroundAnimation ? "visible" : "hidden"}
          variants={backgroundVariants}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-200 to-purple-200 translate-y-1/4 -translate-x-1/4 blur-3xl"
        />
        
        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            custom={particle.id}
            initial={{ opacity: 0 }}
            animate="animate"
            variants={particleVariants}
            style={{
              position: "absolute",
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              background: "linear-gradient(to right, rgba(96, 165, 250, 0.4), rgba(129, 140, 248, 0.4))",
            }}
            transition={{ delay: particle.delay }}
          />
        ))}
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6TTAgMzBoMzB2MzBIMHoiIGZpbGw9IiNmMWY1ZjkiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PHBhdGggZD0iTTAgMGgzMHYzMEgwek0zMCAwaDMwdjMwSDMweiIgZmlsbD0iI2YxZjVmOSIgZmlsbC1vcGFjaXR5PSIuMDIiLz48L2c+PC9zdmc+')] opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-blue-500" />
            <span>Payment Management</span>
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReport}
            className="download-btn bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            <Download className="w-5 h-5" />
            Generate Report
          </motion.button>
        </div>

        {/* Search Bar Component */}
        <SearchBar />

        {loading && filteredOrders.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <>
            <AnimatePresence>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredOrders.slice(0, visibleOrders).map((order) => (
                  <AnimatePresence key={order._id}>
                    <motion.div
                      variants={orderVariants}
                      exit="exit"
                      layout
                      className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_auto] gap-4 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm relative overflow-hidden group"
                    >
                      {/* Order Card Content (Similar to previous implementation) */}
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="relative"
                      >
                        <img className="w-12" src={assets.parcel_icon} alt="Order Icon" />
                      </motion.div>
                      
                      <div className="relative">
                        <div>
                          {order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <p className="py-0.5" key={idx}>
                                {item.name} x {item.quantity} <span>{item.size}</span>
                              </p>
                            ))
                          ) : (
                            <p className="py-0.5">No items in this order.</p>
                          )}
                        </div>
                        <p className="mt-3 mb-2 font-medium">
                          {order.address.firstName + " " + order.address.lastName}
                        </p>
                        <div>
                          <p>{order.address.street + ","}</p>
                          <p>
                            {order.address.city +
                              ", " +
                              order.address.state +
                              ", " +
                              order.address.country +
                              ", " +
                              order.address.zipcode}
                          </p>
                        </div>
                        <p>{order.address.phone}</p>
                      </div>
                      
                      <div className="relative">
                        <p className="text-sm sm:text-[15px]">
                          Items: {order.items.length}
                        </p>
                        <p className="mt-3">Method: {order.paymentMethod}</p>
                        <p>Payment: {order.payment}</p>
                        <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      
                      <motion.p 
                        whileHover={{ scale: 1.05 }}
                        className="text-sm sm:text-[15px] font-bold relative"
                      >
                        {currency}
                        {order.amount}
                      </motion.p>
                      
                      <select
                        onChange={(event) => statusHandler(event, order._id)}
                        value={order.payment}
                        className={`p-2 font-semibold border border-gray-300 rounded-md w-44 relative transition-colors duration-300 ${getStatusColor(
                          order.payment
                        )}`}
                        disabled={loading}
                      >
                        <option value="Pending" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </option>
                        <option value="Paid" className="bg-green-100 text-green-800">
                          Paid
                        </option>
                        <option value="Cancelled" className="bg-red-100 text-red-800">
                          Cancelled
                        </option>
                      </select>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteOrder(order._id)}
                        className="p-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2 w-10 relative"
                        disabled={loading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  </AnimatePresence>
                ))}
              </motion.div>
            </AnimatePresence>

            {visibleOrders < filteredOrders.length && (
              <div className="flex justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMoreOrders}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                >
                  Load More Orders
                </motion.button>
              </div>
            )}
          </>
        )}

        {!loading && filteredOrders.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500"
          >
            <CreditCard className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg">No payments found matching your search</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Orders;