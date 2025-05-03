import React, { useContext, useState, useEffect, useRef } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import * as THREE from 'three'

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod')
  const { navigate, backendURL, token, cartItems, setCartItems, getCartAmount, deliveryFee, products} = useContext(ShopContext)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [completedFields, setCompletedFields] = useState({})
  
  // Countries list for dropdown
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "India",
    "Sri Lanka",
    "Singapore",
    "Malaysia",
    "South Korea",
    "Italy",
    "Spain",
    "Brazil",
    "Mexico",
    "South Africa",
    "United Arab Emirates",
    "Thailand",
    "New Zealand"
  ];
  
  // Refs for Three.js
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const animationFrameRef = useRef(null)
  const particlesRef = useRef(null)

  // Animation setup
  useEffect(() => {
    if (!canvasRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5
    cameraRef.current = camera
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 1000
    
    const posArray = new Float32Array(particlesCount * 3)
    const colorsArray = new Float32Array(particlesCount * 3)
    
    // Fill with random positions and colors
    for(let i = 0; i < particlesCount * 3; i++) {
      // Positions
      posArray[i] = (Math.random() - 0.5) * 10
      
      // Colors - blue/teal gradient
      if (i % 3 === 0) colorsArray[i] = 0.1 + Math.random() * 0.2 // R
      if (i % 3 === 1) colorsArray[i] = 0.5 + Math.random() * 0.3 // G
      if (i % 3 === 2) colorsArray[i] = 0.7 + Math.random() * 0.3 // B
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    })
    
    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)
    particlesRef.current = particlesMesh
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Animation loop
    const animate = () => {
      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.0005
        particlesRef.current.rotation.y += 0.001
        
        // Make particles move more when form is being completed
        if (focusedField) {
          particlesRef.current.rotation.y += 0.0005
        }
        
        // Animate particles more intensely during submission
        if (isSubmitting) {
          particlesRef.current.rotation.y += 0.002
          particlesRef.current.rotation.x += 0.001
        }
      }
      
      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
      
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose()
        particlesRef.current.material.dispose()
        scene.remove(particlesRef.current)
      }
    }
  }, [focusedField, isSubmitting])

  const onFocusHandler = (fieldName) => {
    setFocusedField(fieldName)
    
    // Create ripple effect in particles when field is focused
    if (particlesRef.current) {
      particlesRef.current.material.size = 0.03
      setTimeout(() => {
        if (particlesRef.current) {
          particlesRef.current.material.size = 0.02
        }
      }, 300)
    }
  }
  
  const onBlurHandler = (fieldName) => {
    setFocusedField(null)
    
    // Validate field on blur
    validateField(fieldName, formData[fieldName])
    
    // Mark field as completed if it has a value and no errors
    if (formData[fieldName] && formData[fieldName].trim() !== '' && !errors[fieldName]) {
      setCompletedFields(prev => ({
        ...prev,
        [fieldName]: true
      }))
    } else {
      setCompletedFields(prev => {
        const newState = {...prev}
        delete newState[fieldName]
        return newState
      })
    }
  }

  // Validation functions
  const validateField = (name, value) => {
    let newErrors = { ...errors }

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!/^[a-zA-Z\s]+$/.test(value) && value !== '') {
          newErrors[name] = 'Only alphabetic characters allowed';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value !== '') {
          newErrors[name] = 'Invalid email format';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'zipcode':
        if (!/^\d+$/.test(value) && value !== '') {
          newErrors[name] = 'Only numbers allowed';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'phone':
        if (!/^\d{10}$/.test(value) && value !== '') {
          newErrors[name] = 'Phone number must be exactly 10 digits';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'city':
      case 'state':
        if (!/^[a-zA-Z\s]+$/.test(value) && value !== '') {
          newErrors[name] = 'Only alphabetic characters allowed';
        } else {
          delete newErrors[name];
        }
        break;
      
      case 'country':
        if (value === '') {
          newErrors[name] = 'Please select a country';
        } else {
          delete newErrors[name];
        }
        break;
      
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const validateAllFields = () => {
    let isValid = true;
    let newErrors = {};

    // Validate each field
    Object.entries(formData).forEach(([key, value]) => {
      if (!validateField(key, value)) {
        isValid = false;
      }
    });

    // Check for empty required fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const onChangeHandler = (e) => {
    const name = e.target.name
    const value = e.target.value

    // Apply input restrictions based on field type
    let updatedValue = value;

    switch (name) {
      case 'firstName':
      case 'lastName':
      case 'city':
      case 'state':
        // Allow only letters and spaces
        updatedValue = value.replace(/[^a-zA-Z\s]/g, '');
        break;
      
      case 'zipcode':
        // Allow only numbers
        updatedValue = value.replace(/\D/g, '');
        break;
      
      case 'phone':
        // Allow only numbers and limit to 10 digits
        updatedValue = value.replace(/\D/g, '').substring(0, 10);
        break;
      
      default:
        break;
    }

    setFormData(data => ({...data, [name]: updatedValue}));
    validateField(name, updatedValue);
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateAllFields()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Create wave effect on background particles
      if (particlesRef.current) {
        particlesRef.current.material.size = 0.05;
        particlesRef.current.rotation.x += 0.5;
        
        // Reset after animation completes
        setTimeout(() => {
          if (particlesRef.current) {
            particlesRef.current.material.size = 0.02;
          }
        }, 2000);
      }
      
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + deliveryFee,
      };
      
      switch (method) {
        // Api calls for cash on delivery
        case 'cod': {
          const response = await axios.post(backendURL + '/api/order/place', orderData, {headers: {token}});
          if (response.data.success) {
            setCartItems({});
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }

          break;
        }

        // Api calls for stripe payment
        case 'stripe': {
          const responseStripe = await axios.post(backendURL + '/api/order/stripe', orderData, {headers: {token}});

          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }

          break;
        }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Calculate form completion percentage for progress animation
  const formCompletionPercentage = () => {
    const totalFields = Object.keys(formData).length;
    const completedFieldsCount = Object.keys(completedFields).length;
    return (completedFieldsCount / totalFields) * 100;
  }

  return (
    <div className="relative">
      {/* Three.js Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      />
      
      {/* Form Completion Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-20">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-teal-400 transition-all duration-700 ease-in-out"
          style={{ width: `${formCompletionPercentage()}%` }}
        ></div>
      </div>
      
      <form onSubmit={onSubmitHandler} className={`relative z-10 flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-6 ${isSubmitting ? 'animate-pulse' : ''}`}>
        {/* Left Side */}
        <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
          <div className='text-xl sm:text-2xl my-3 animate-fade-in'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'} />
          </div>
          
          <div className='flex gap-3'>
            <div className={`w-full relative group`}>
              <input 
                onChange={onChangeHandler} 
                onFocus={() => onFocusHandler('firstName')} 
                onBlur={() => onBlurHandler('firstName')} 
                name='firstName' 
                value={formData.firstName} 
                className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300
                  ${focusedField === 'firstName' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                  ${completedFields.firstName ? 'border-green-300' : ''}
                  ${errors.firstName ? 'border-red-300' : ''}
                `} 
                type='text' 
                placeholder='First name' 
                required 
              />
              {completedFields.firstName && !errors.firstName && (
                <span className="absolute right-3 top-2 text-green-500 animate-bounce-in">✓</span>
              )}
              {errors.firstName && (
                <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>
              )}
            </div>
            
            <div className={`w-full relative group`}>
              <input 
                onChange={onChangeHandler} 
                onFocus={() => onFocusHandler('lastName')} 
                onBlur={() => onBlurHandler('lastName')} 
                name='lastName' 
                value={formData.lastName} 
                className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300
                  ${focusedField === 'lastName' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                  ${completedFields.lastName ? 'border-green-300' : ''}
                  ${errors.lastName ? 'border-red-300' : ''}
                `} 
                type='text' 
                placeholder='Last name' 
                required 
              />
              {completedFields.lastName && !errors.lastName && (
                <span className="absolute right-3 top-2 text-green-500 animate-bounce-in">✓</span>
              )}
              {errors.lastName && (
                <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>
              )}
            </div>
          </div>
          
          <div className="relative group">
            <input 
              onChange={onChangeHandler} 
              onFocus={() => onFocusHandler('email')} 
              onBlur={() => onBlurHandler('email')} 
              name='email' 
              value={formData.email} 
              className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300
                ${focusedField === 'email' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                ${completedFields.email ? 'border-green-300' : ''}
                ${errors.email ? 'border-red-300' : ''}
              `} 
              type='email' 
              placeholder='Email address' 
              required 
            />
            {completedFields.email && !errors.email && (
              <span className="absolute right-3 top-2 text-green-500 animate-bounce-in">✓</span>
            )}
            {errors.email && (
              <div className="text-red-500 text-xs mt-1">{errors.email}</div>
            )}
          </div>
          
          <div className="relative group">
            <input 
              onChange={onChangeHandler} 
              onFocus={() => onFocusHandler('street')} 
              onBlur={() => onBlurHandler('street')} 
              name='street' 
              value={formData.street} 
              className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300
                ${focusedField === 'street' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                ${completedFields.street ? 'border-green-300' : ''}
                ${errors.street ? 'border-red-300' : ''}
              `} 
              type='text' 
              placeholder='Address' 
              required 
            />
            {completedFields.street && !errors.street && (
              <span className="absolute right-3 top-2 text-green-500 animate-bounce-in">✓</span>
            )}
            {errors.street && (
              <div className="text-red-500 text-xs mt-1">{errors.street}</div>
            )}
          </div>
          
          <div className='flex gap-3'>
            <div className="w-full relative group">
              <input 
                onChange={onChangeHandler} 
                onFocus={() => onFocusHandler('city')} 
                onBlur={() => onBlurHandler('city')} 
                name='city' 
                value={formData.city} 
                className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300
                  ${focusedField === 'city' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                  ${completedFields.city ? 'border-green-300' : ''}
                  ${errors.city ? 'border-red-300' : ''}
                `} 
                type='text' 
                placeholder='City' 
                required 
              />
              {completedFields.city && !errors.city && (
                <span className="absolute right-3 top-2 text-green-500 animate-bounce-in">✓</span>
              )}
              {errors.city && (
                <div className="text-red-500 text-xs mt-1">{errors.city}</div>
              )}
            </div>
            
            <div className="w-full relative group">
              <input 
                onChange={onChangeHandler} 
                onFocus={() => onFocusHandler('state')} 
                onBlur={() => onBlurHandler('state')} 
                name='state' 
                value={formData.state} 
                className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300
                  ${focusedField === 'state' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                  ${completedFields.state ? 'border-green-300' : ''}
                  ${errors.state ? 'border-red-300' : ''}
                `} 
                type='text' 
                placeholder='State' 
                required 
              />
              {completedFields.state && !errors.state && (
                <span className="absolute right-3 top-2 text-green-500 animate-bounce-in">✓</span>
              )}
              {errors.state && (
                <div className="text-red-500 text-xs mt-1">{errors.state}</div>
              )}
            </div>
          </div>
          
          <div className='flex gap-3'>
            <div className="w-full relative group">
              <input 
                onChange={onChangeHandler} 
                onFocus={() => onFocusHandler('zipcode')} 
                onBlur={() => onBlurHandler('zipcode')} 
                name='zipcode' 
                value={formData.zipcode} 
                className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300
                  ${focusedField === 'zipcode' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                  ${completedFields.zipcode ? 'border-green-300' : ''}
                  ${errors.zipcode ? 'border-red-300' : ''}
                `} 
                type='text' 
                placeholder='Zipcode' 
                required 
              />
              {completedFields.zipcode && !errors.zipcode && (
                <span className="absolute right-3 top-2 text-green-500 animate-bounce-in">✓</span>
              )}
              {errors.zipcode && (
                <div className="text-red-500 text-xs mt-1">{errors.zipcode}</div>
              )}
            </div>
            
            <div className="w-full relative group">
              <select 
                onChange={onChangeHandler} 
                onFocus={() => onFocusHandler('country')} 
                onBlur={() => onBlurHandler('country')} 
                name='country' 
                value={formData.country} 
                className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300 appearance-none
                  ${focusedField === 'country' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                  ${completedFields.country ? 'border-green-300' : ''}
                  ${errors.country ? 'border-red-300' : ''}
                `} 
                required 
              >
                <option value="" disabled>Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <div className="absolute right-3 top-2.5 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>
              {completedFields.country && !errors.country && (
                <span className="absolute right-8 top-2 text-green-500 animate-bounce-in">✓</span>
              )}
              {errors.country && (
                <div className="text-red-500 text-xs mt-1">{errors.country}</div>
              )}
            </div>
          </div>
          
          <div className="relative group">
            <input 
              onChange={onChangeHandler} 
              onFocus={() => onFocusHandler('phone')} 
              onBlur={() => onBlurHandler('phone')} 
              name='phone' 
              value={formData.phone} 
              className={`border rounded py-1.5 px-3.5 w-full transition-all duration-300
                ${focusedField === 'phone' ? 'border-blue-400 ring-2 ring-blue-200 transform scale-105' : 'border-gray-300'}
                ${completedFields.phone ? 'border-green-300' : ''}
                ${errors.phone ? 'border-red-300' : ''}
              `} 
              type='text' 
              placeholder='Phone number (10 digits)' 
              required 
            />
            {completedFields.phone && !errors.phone && (
              <span className="absolute right-3 top-2 text-green-500 animate-bounce-in">✓</span>
            )}
            {errors.phone && (
              <div className="text-red-500 text-xs mt-1">{errors.phone}</div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className='mt-8'>
          <div className='mt-8 min-w-80 bg-white bg-opacity-70 p-4 rounded-lg shadow-md transition-all duration-500 hover:shadow-lg hover:bg-opacity-80'>
            <CartTotal />
          </div>
          <div className='mt-12 bg-white bg-opacity-70 p-4 rounded-lg shadow-md transition-all duration-500'>
            <Title text1={'PAYMENT'} text2={'METHOD'} />
            {/* Payment Method Selection */}
            <div className='flex gap-3 flex-col lg:flex-row mt-4'>
              <div 
                onClick={() => setMethod('stripe')} 
                className={`flex items-center gap-3 border p-2 px-3 cursor-pointer rounded-md transition-all duration-500 
                  ${method === 'stripe' ? 'border-blue-400 shadow-md transform scale-105' : 'border-gray-300'}`}
              >
                <p className={`min-w-3.5 h-3.5 border rounded-full transition-all duration-300 
                  ${method ==='stripe'? 'bg-green-400 animate-pulse' : ''}`}></p>
                <img src={assets.stripe_logo} className='h-5 mx-4' alt='Stripe Logo' />
              </div>
              <div 
                onClick={() => setMethod('cod')} 
                className={`flex items-center gap-3 border p-2 px-3 cursor-pointer rounded-md transition-all duration-500 
                  ${method === 'cod' ? 'border-blue-400 shadow-md transform scale-105' : 'border-gray-300'}`}
              >
                <p className={`min-w-3.5 h-3.5 border rounded-full transition-all duration-300 
                  ${method === 'cod'? 'bg-green-400 animate-pulse' : ''}`}></p>
                <p className='text-sm font-medium mx-4 text-gray-500'>CASH ON DELIVERY</p>
              </div>
            </div>

            <div className='w-full text-end mt-8'>
              <button 
                type='submit' 
                disabled={isSubmitting}
                className={`relative px-16 py-3 text-sm bg-black text-white rounded-md transition-all duration-500 
                  hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-1 overflow-hidden
                  ${isSubmitting ? 'cursor-wait opacity-80' : ''}`}
              >
                {isSubmitting && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                <span className={isSubmitting ? 'opacity-0' : ''}>PLACE ORDER</span>
                
                {/* Button shine effect */}
                <span className="absolute top-0 -left-full h-full w-full bg-white opacity-10 transform rotate-12 transition-all duration-1000 group-hover:translate-x-full"></span>
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-bounce-in {
          animation: bounceIn 0.5s ease-out forwards;
        }
        
        input:focus, select:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}

export default PlaceOrder