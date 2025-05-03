import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl, currency } from "../App"
import * as THREE from 'three'

const CustomerManagement = ({ token }) => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [membershipType, setMembershipType] = useState('Standard')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [stats, setStats] = useState({ total: 0, premium: 0, standard: 0, basic: 0 })
  const [showReportModal, setShowReportModal] = useState(false)
  
  // Three.js animation reference
  const threeCanvasRef = useRef(null)
  const sceneRef = useRef(null)
  
  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendUrl}/api/user/all`, {
        headers: { token }
      })
      
      if (response.data.success) {
        // Ensuring each customer has a membershipType
        const enhancedUsers = response.data.users.map(user => ({
          ...user,
          membershipType: user.membershipType || 'Standard'
        }))
        setCustomers(enhancedUsers)
        
        // Calculate stats
        const total = enhancedUsers.length
        const premium = enhancedUsers.filter(u => u.membershipType === 'Premium').length
        const standard = enhancedUsers.filter(u => u.membershipType === 'Standard').length
        const basic = enhancedUsers.filter(u => u.membershipType === 'Basic').length
        
        setStats({ total, premium, standard, basic })
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  // Initialize edit form with customer data
  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setName(customer.name)
    setEmail(customer.email)
    setMembershipType(customer.membershipType || 'Standard')
  }

  // Cancel editing
  const handleCancel = () => {
    setEditingCustomer(null)
    setName('')
    setEmail('')
    setMembershipType('Standard')
  }

  // Update customer
  const handleUpdate = async (e) => {
    e.preventDefault()
    
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/update/${editingCustomer._id}`,
        { name, email, membershipType },
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success('Customer updated successfully')
        handleCancel()
        fetchCustomers()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to update customer')
    }
  }

  // Delete customer
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }
    
    try {
      const response = await axios.delete(
        `${backendUrl}/api/user/delete/${id}`,
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success('Customer deleted successfully')
        fetchCustomers()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to delete customer')
    }
  }
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  // Filtered and sorted customers
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.membershipType || 'Standard').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const fieldA = sortField === 'membershipType' 
        ? (a[sortField] || 'Standard') 
        : a[sortField]
      const fieldB = sortField === 'membershipType' 
        ? (b[sortField] || 'Standard') 
        : b[sortField]
        
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  
  // Generate and download CSV report
  const downloadCSVReport = () => {
    // Create CSV content
    const headers = "Name,Email,Membership Type\n"
    const rows = customers.map(customer => 
      `${customer.name},${customer.email},${customer.membershipType || 'Standard'}`
    ).join('\n')
    const csvContent = `${headers}${rows}`
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'customer-report.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Three.js animation setup
  useEffect(() => {
    if (!threeCanvasRef.current) return
    
    // Initialize Three.js scene
    const canvas = threeCanvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    
    // Create 3D graph representing customer data
    const createCustomerVisual = () => {
      // Clear existing objects
      while(scene.children.length > 0) { 
        scene.remove(scene.children[0])
      }
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(0, 10, 5)
      scene.add(directionalLight)
      
      // Add bars for each membership type
      const barWidth = 0.8
      const spacing = 1.2
      
      // Basic members (blue)
      const basicGeometry = new THREE.BoxGeometry(barWidth, stats.basic * 0.2, barWidth)
      const basicMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db })
      const basicBar = new THREE.Mesh(basicGeometry, basicMaterial)
      basicBar.position.set(-spacing, stats.basic * 0.1, 0)
      scene.add(basicBar)
      
      // Standard members (green)
      const standardGeometry = new THREE.BoxGeometry(barWidth, stats.standard * 0.2, barWidth)
      const standardMaterial = new THREE.MeshPhongMaterial({ color: 0x2ecc71 })
      const standardBar = new THREE.Mesh(standardGeometry, standardMaterial)
      standardBar.position.set(0, stats.standard * 0.1, 0)
      scene.add(standardBar)
      
      // Premium members (gold)
      const premiumGeometry = new THREE.BoxGeometry(barWidth, stats.premium * 0.2, barWidth)
      const premiumMaterial = new THREE.MeshPhongMaterial({ color: 0xf1c40f })
      const premiumBar = new THREE.Mesh(premiumGeometry, premiumMaterial)
      premiumBar.position.set(spacing, stats.premium * 0.1, 0)
      scene.add(premiumBar)
    }
    
    createCustomerVisual()
    
    // Position camera
    camera.position.z = 5
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      // Rotate the scene slightly
      scene.rotation.y += 0.01
      
      renderer.render(scene, camera)
    }
    
    animate()
    
    // Store scene reference for updates
    sceneRef.current = { scene, createCustomerVisual }
    
    // Cleanup function
    return () => {
      renderer.dispose()
    }
  }, [stats])
  
  // Update Three.js visual when stats change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.createCustomerVisual()
    }
  }, [stats])

  // Load customers on component mount
  useEffect(() => {
    if (token) {
      fetchCustomers()
    }
  }, [token])

  // Simple report modal
  const ReportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-xl w-full">
        <h2 className="text-xl font-bold mb-4">Customer Report</h2>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left border-b">Name</th>
                <th className="py-2 px-4 text-left border-b">Email</th>
                <th className="py-2 px-4 text-left border-b">Membership</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td className="py-2 px-4 border-b">{customer.name}</td>
                  <td className="py-2 px-4 border-b">{customer.email}</td>
                  <td className="py-2 px-4 border-b">{customer.membershipType || 'Standard'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-6">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
            onClick={() => downloadCSVReport()}
          >
            Download as CSV
          </button>
          <button 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => setShowReportModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center transform transition-transform hover:scale-105">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-500">Total Customers</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center transform transition-transform hover:scale-105">
              <div className="text-2xl font-bold text-yellow-500">{stats.premium}</div>
              <div className="text-gray-500">Premium Members</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center transform transition-transform hover:scale-105">
              <div className="text-2xl font-bold text-green-500">{stats.standard}</div>
              <div className="text-gray-500">Standard Members</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center transform transition-transform hover:scale-105">
              <div className="text-2xl font-bold text-blue-400">{stats.basic}</div>
              <div className="text-gray-500">Basic Members</div>
            </div>
          </div>
          
         
          
          {/* Actions Row */}
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <button 
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Generate Report
              </button>
            </div>
          </div>
          
          {/* Edit Form */}
          {editingCustomer && (
            <div className="bg-white p-6 mb-6 rounded-lg shadow overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">Edit Customer</h2>
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Membership Type</label>
                  <select
                    value={membershipType}
                    onChange={(e) => setMembershipType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Customer
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

         
          {/* Customer Table (Alternative View) */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Customer Table</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        Name
                        {sortField === 'name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('email')}>
                      <div className="flex items-center">
                        Email
                        {sortField === 'email' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('membershipType')}>
                      <div className="flex items-center">
                        Membership
                        {sortField === 'membershipType' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{customer.name}</td>
                        <td className="py-3 px-4">{customer.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${customer.membershipType === 'Premium' ? 'bg-yellow-100 text-yellow-800' : 
                              customer.membershipType === 'Standard' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {customer.membershipType || 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(customer)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(customer._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Report Modal */}
          {showReportModal && <ReportModal />}
        </>
      )}
    </div>
  )
}

export default CustomerManagement