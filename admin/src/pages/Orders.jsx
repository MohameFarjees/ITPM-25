import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { Download, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch all orders from the backend
  const fetchAllOrders = async () => {
    if (!token) return null;

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
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Status update handler
  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Generate and download CSV report
  const generateReport = () => {
    if (orders.length === 0) {
      toast.error("No orders available to generate a report.");
      return;
    }

    const headers = [
      "Order ID", "Customer Name", "Items", "Address", "Phone", 
      "Payment Method", "Payment Status", "Amount", "Date", "Order Status"
    ];
    const rows = orders.map((order) => [
      order._id,
      `${order.address.firstName} ${order.address.lastName}`,
      order.items.map((item) => `${item.name} x ${item.quantity}`).join(", "),
      `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`,
      order.address.phone,
      order.paymentMethod,
      order.payment ? "Done" : "Pending",
      `${currency}${order.amount}`,
      new Date(order.date).toLocaleDateString(),
      order.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search and filter logic
  const handleSearch = (term) => {
    setSearchTerm(term);
    filterOrders(term, statusFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    filterOrders(searchTerm, status);
  };

  const filterOrders = (term, status) => {
    let result = orders;

    if (term) {
      result = result.filter(order => 
        `${order.address.firstName} ${order.address.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(term.toLowerCase())) ||
        order._id.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (status !== "All") {
      result = result.filter(order => order.status === status);
    }

    setFilteredOrders(result);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setFilteredOrders(orders);
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0"
      >
        <h3 className="text-3xl font-bold text-gray-800">Order Management</h3>
        <div className="flex space-x-4">
          <motion.div 
            className="flex items-center bg-white shadow-md rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="ml-3 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="p-2 w-full md:w-64 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>
          <motion.button
            onClick={generateReport}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Generate Report
          </motion.button>
        </div>
      </motion.div>

      <div className="flex items-center space-x-4 mb-6">
        <select 
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          <option value="Order Placed">Order Placed</option>
          <option value="Packing">Packing</option>
          <option value="Shipped">Shipped</option>
          <option value="Out for delivery">Out for delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
        {(searchTerm !== "" || statusFilter !== "All") && (
          <motion.button
            onClick={resetFilters}
            whileHover={{ rotate: 90 }}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 mt-10"
          >
            No orders found
          </motion.div>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow-md rounded-lg grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            >
              <img className="w-12" src={assets.parcel_icon} alt="Parcel Icon" />
              <div>
                <div>
                  {order.items.map((item, index) => (
                    <p className="py-0.5" key={index}>
                      {item.name} x {item.quantity}
                      <span>{item.size}</span>
                      {index < order.items.length - 1 ? ', ' : ''}
                    </p>
                  ))}
                </div>
                <p className="mt-3 mb-2 font-medium">
                  {order.address.firstName + " " + order.address.lastName}
                </p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>
                    {`${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`}
                  </p>
                </div>
                <p>{order.address.phone}</p>
              </div>
              <div>
                <p className="text-sm sm:text-[15px]">
                  Items: {order.items.length}
                </p>
                <p className="mt-3">Method: {order.paymentMethod}</p>
                <p>Payment: {order.payment ? "Done" : "Pending"}</p>
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className="text-sm sm:text-[15px]">
                {currency}{order.amount}
              </p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 font-semibold rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;