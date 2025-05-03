import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CartTotal from '../components/CartTotal'

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, updateSize } = useContext(ShopContext)

  const [cartData, setCartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Define available sizes
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL']

  useEffect(() => {
    // Check if products are loaded
    if (products && products.length > 0) {
      const tempData = []
      
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            // Verify this product exists in products array
            const productExists = products.some(product => product._id === items)
            if (productExists) {
              tempData.push({
                _id: items,
                size: item,
                quantity: cartItems[items][item]
              })
            } else {
              console.warn(`Product with ID ${items} not found in products array`)
            }
          }
        }
      }
      setCartData(tempData)
      setIsLoading(false)
    }
  }, [cartItems, products])

  // Function to handle size change
  const handleSizeChange = (productId, currentSize, newSize) => {
    // First get the current quantity
    const currentQuantity = cartItems[productId][currentSize]
    
    // Remove item with old size (set quantity to 0)
    updateQuantity(productId, currentSize, 0)
    
    // Add item with new size
    updateQuantity(productId, newSize, currentQuantity)
  }

  // Show loading state if products aren't loaded yet
  if (isLoading && (!products || products.length === 0)) {
    return <div className="flex justify-center items-center h-64">Loading your cart...</div>
  }

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {cartData.length === 0 ? (
          <div className="text-center py-8">
            <p>Your cart is empty</p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 px-6 py-2 bg-black text-white"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id)

            return (
              <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[3fr_1fr_1fr_0.5fr] items-center gap-4'>
                <div className='flex items-start gap-6'>
                  {productData ? (
                    <>
                      <img 
                        src={productData.image?.[0] || assets.placeholder_image} 
                        className='w-16 sm:w-20' 
                        alt='Product Image' 
                      />
                      <div>
                        <p className='text-sm sm:text-lg font-medium'>{productData.name}</p>
                        <div className='flex items-center gap-5 mt-2'>
                          <p>{currency}{productData.price}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-red-500">Product not found</div>
                  )}
                </div>
                
                {/* Size selection dropdown */}
                <select
                  value={item.size}
                  onChange={(e) => handleSizeChange(item._id, item.size, e.target.value)}
                  className='border px-2 py-1 bg-white'
                >
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                
                <input 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== '' && value !== '0') {
                      updateQuantity(item._id, item.size, Number(value));
                    }
                  }} 
                  className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' 
                  type='number' 
                  min={1} 
                  defaultValue={item.quantity} 
                />
                <img 
                  onClick={() => updateQuantity(item._id, item.size, 0)} 
                  src={assets.bin_icon} 
                  className='w-4 mr-4 sm:w-5 cursor-pointer' 
                  alt='Bin Icon' 
                />
              </div>
            )
          })
        )}
      </div>

      {cartData.length > 0 && (
        <div className='flex justify-end my-20'>
          <div className='w-full sm:w-[450px]'>
            <CartTotal />
            <div className='w-full text-end'>
              <button 
                onClick={() => navigate('/place-order')} 
                className='text-sm my-8 px-8 py-3 bg-black text-white'
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart