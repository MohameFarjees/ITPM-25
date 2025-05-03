import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { Download, Search, Edit, Trash2, X, Save, RefreshCw } from "lucide-react"; 

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: ""
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/product/list");

      if (response.data.success) {
        setList(response.data.products);
        setFilteredList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to remove product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      name: product.name,
      category: product.category,
      price: product.price
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Validate form data
      if (!editForm.name.trim() || !editForm.category.trim() || !editForm.price) {
        toast.error("All fields are required");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/product/update`,
        {
          id: editingProduct,
          name: editForm.name,
          category: editForm.category,
          price: parseFloat(editForm.price)
        },
        { 
          headers: { 
            token,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Product updated successfully");
        setEditingProduct(null);
        await fetchList();
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update product");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term.trim() === "") {
      setFilteredList(list);
    } else {
      const results = list.filter(
        item => 
          item.name.toLowerCase().includes(term) || 
          item.category.toLowerCase().includes(term)
      );
      setFilteredList(results);
    }
  };

  const generateReport = () => {
    if (list.length === 0) {
      toast.error("No products available to generate a report.");
      return;
    }

    // Create CSV content
    const headers = ["Image", "Name", "Category", "Price"];
    const rows = list.map((item) => [
      item.image[0], // Image URL
      item.name, // Product Name
      item.category, // Category
      `${currency}${item.price}`, // Price
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
    link.setAttribute("download", "products_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="transition-all duration-300 ease-in-out">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Product Inventory</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          <button
            onClick={generateReport}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            Report
          </button>
          
          <button
            onClick={fetchList}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-gray-500 text-lg">No products found</div>
          {searchTerm && (
            <div className="mt-2 text-gray-400">
              Try adjusting your search query
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
          {/* List Table Title */}
          <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-3 px-4 bg-gray-100 text-sm font-semibold text-gray-700">
            <div>Image</div>
            <div>Name</div>
            <div>Category</div>
            <div>Price</div>
            <div className="text-center">Actions</div>
          </div>

          {/* Product List */}
          <div className="flex flex-col divide-y">
            {filteredList.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-3 px-4 hover:bg-gray-50 transition-colors animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-center md:justify-start">
                  <img 
                    src={item.image[0]} 
                    className="w-16 h-16 object-cover rounded-md shadow-sm hover:scale-105 transition-transform" 
                    alt={item.name} 
                  />
                </div>
                
                {editingProduct === item._id ? (
                  <>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="p-2 border rounded w-full"
                    />
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="p-2 border rounded w-full"
                    />
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                      className="p-2 border rounded w-full"
                    />
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={handleSaveEdit}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setEditingProduct(null)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-gray-600">{item.category}</div>
                    <div className="font-medium text-gray-800">{currency}{item.price}</div>
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeProduct(item._id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default List;