import { useState } from 'react'

const SizeChart = () => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <div>
      {/* Size Chart Button */}
      <button 
        onClick={openModal}
        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Size Chart
      </button>

      {/* Modal/Popup */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Size Chart</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Size Chart Tabs */}
            <SizeChartTabs />
          </div>
        </div>
      )}
    </div>
  )
}

const SizeChartTabs = () => {
  const [activeTab, setActiveTab] = useState('men')

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('men')}
          className={`px-4 py-2 ${activeTab === 'men' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Men
        </button>
        <button
          onClick={() => setActiveTab('women')}
          className={`px-4 py-2 ${activeTab === 'women' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Women
        </button>
        <button
          onClick={() => setActiveTab('kids')}
          className={`px-4 py-2 ${activeTab === 'kids' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Kids
        </button>
      </div>

      {/* Content */}
      {activeTab === 'men' && <MenSizeChart />}
      {activeTab === 'women' && <WomenSizeChart />}
      {activeTab === 'kids' && <KidsSizeChart />}

      <div className="mt-4 text-sm text-gray-500">
        <p>Note: These are general size guidelines. Actual sizes may vary by style and brand.</p>
      </div>
    </div>
  )
}

const MenSizeChart = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left font-medium">Size</th>
            <th className="px-4 py-2 text-left font-medium">Chest (in)</th>
            <th className="px-4 py-2 text-left font-medium">Waist (in)</th>
            <th className="px-4 py-2 text-left font-medium">Hip (in)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2">S</td>
            <td className="px-4 py-2">36-38</td>
            <td className="px-4 py-2">30-32</td>
            <td className="px-4 py-2">36-38</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">M</td>
            <td className="px-4 py-2">38-40</td>
            <td className="px-4 py-2">32-34</td>
            <td className="px-4 py-2">38-40</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">L</td>
            <td className="px-4 py-2">40-42</td>
            <td className="px-4 py-2">34-36</td>
            <td className="px-4 py-2">40-42</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">XL</td>
            <td className="px-4 py-2">42-44</td>
            <td className="px-4 py-2">36-38</td>
            <td className="px-4 py-2">42-44</td>
          </tr>
          <tr>
            <td className="px-4 py-2">XXL</td>
            <td className="px-4 py-2">44-46</td>
            <td className="px-4 py-2">38-40</td>
            <td className="px-4 py-2">44-46</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const WomenSizeChart = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left font-medium">Size</th>
            <th className="px-4 py-2 text-left font-medium">Bust (in)</th>
            <th className="px-4 py-2 text-left font-medium">Waist (in)</th>
            <th className="px-4 py-2 text-left font-medium">Hip (in)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2">XS</td>
            <td className="px-4 py-2">32-33</td>
            <td className="px-4 py-2">24-25</td>
            <td className="px-4 py-2">34-35</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">S</td>
            <td className="px-4 py-2">34-35</td>
            <td className="px-4 py-2">26-27</td>
            <td className="px-4 py-2">36-37</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">M</td>
            <td className="px-4 py-2">36-37</td>
            <td className="px-4 py-2">28-29</td>
            <td className="px-4 py-2">38-39</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">L</td>
            <td className="px-4 py-2">38-40</td>
            <td className="px-4 py-2">30-32</td>
            <td className="px-4 py-2">40-42</td>
          </tr>
          <tr>
            <td className="px-4 py-2">XL</td>
            <td className="px-4 py-2">41-43</td>
            <td className="px-4 py-2">33-35</td>
            <td className="px-4 py-2">43-45</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const KidsSizeChart = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left font-medium">Size</th>
            <th className="px-4 py-2 text-left font-medium">Age</th>
            <th className="px-4 py-2 text-left font-medium">Height (in)</th>
            <th className="px-4 py-2 text-left font-medium">Chest (in)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2">2T</td>
            <td className="px-4 py-2">2 years</td>
            <td className="px-4 py-2">33-36</td>
            <td className="px-4 py-2">21</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">3T</td>
            <td className="px-4 py-2">3 years</td>
            <td className="px-4 py-2">36-39</td>
            <td className="px-4 py-2">22</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">4T</td>
            <td className="px-4 py-2">4 years</td>
            <td className="px-4 py-2">39-42</td>
            <td className="px-4 py-2">23</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-2">5</td>
            <td className="px-4 py-2">5 years</td>
            <td className="px-4 py-2">42-45</td>
            <td className="px-4 py-2">24</td>
          </tr>
          <tr>
            <td className="px-4 py-2">6</td>
            <td className="px-4 py-2">6 years</td>
            <td className="px-4 py-2">45-48</td>
            <td className="px-4 py-2">25</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default SizeChart