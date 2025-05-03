import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, X, ShoppingBag, ChevronRight, Map, Clock, Truck, CreditCard, RefreshCw } from "lucide-react";

const FloatingChatBotButton = () => {
  const navigate = useNavigate();
  const [showBubble, setShowBubble] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const chatContainerRef = useRef(null);

  // Enhanced clothing store categories
  const categories = [
    { 
      id: "general", 
      name: "General Questions",
      icon: <Clock className="w-5 h-5" />,
      color: "bg-blue-500"
    },
    { 
      id: "shipping", 
      name: "Shipping & Delivery",
      icon: <Truck className="w-5 h-5" />,
      color: "bg-green-500"
    },
    { 
      id: "returns", 
      name: "Returns & Exchanges",
      icon: <RefreshCw className="w-5 h-5" />,
      color: "bg-red-500"
    },
    { 
      id: "payment", 
      name: "Payment Options",
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-purple-500"
    },
    { 
      id: "products", 
      name: "Product Information",
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "bg-yellow-500"
    },
    { 
      id: "stores", 
      name: "Store Locations",
      icon: <Map className="w-5 h-5" />,
      color: "bg-pink-500"
    }
  ];

  // Expanded category-specific questions
  const categoryQuestions = {
    general: [
      "What are your store hours?",
      "Do you have a loyalty program?",
      "How can I contact customer service?",
      "Are there any current promotions?",
    ],
    shipping: [
      "Do you offer international shipping?",
      "How long does shipping take?",
      "Is there free shipping available?",
      "How can I track my order?",
    ],
    returns: [
      "What is your return policy?",
      "How do I start a return?",
      "Can I exchange for a different size?",
      "Do I need the original packaging to return?",
    ],
    payment: [
      "What payment methods do you accept?",
      "Is there a layaway or installment option?",
      "Are my payment details secure?",
      "Can I use multiple payment methods?",
    ],
    products: [
      "Do you have a size guide?",
      "Are your clothes ethically sourced?",
      "Do you have plus sizes available?",
      "How should I care for my purchases?",
    ],
    stores: [
      "Where is your nearest store?",
      "Can I reserve items for in-store pickup?",
      "Do all stores carry the same inventory?",
      "Are there any store-exclusive items?",
    ],
  };

  // Expanded category-specific answers
  const categoryAnswers = {
    general: [
      "Our stores are open from 10 AM to 9 PM Monday through Saturday, and 11 AM to 7 PM on Sundays.",
      "Yes! Our TrendRewards program gives you 1 point for every dollar spent. Collect 200 points to receive a $20 coupon.",
      "You can reach our customer service team at support@trendify.com or call us at 1-800-TRENDY (873-639) from 9 AM to 8 PM EST.",
      "We're currently running our Summer Collection Sale with up to 50% off selected items. New members also get 15% off their first purchase!",
    ],
    shipping: [
      "Yes, we ship to over 90 countries worldwide. International shipping costs vary by location and order value.",
      "Domestic orders typically arrive within 3-5 business days. International deliveries can take 7-14 business days depending on the destination.",
      "We offer free standard shipping on all domestic orders over $75. Premium and express shipping options are available at checkout.",
      "Once your order ships, you'll receive a confirmation email with tracking information. You can also track your order in your account dashboard.",
    ],
    returns: [
      "We accept returns within 30 days of purchase. Items must be unworn with original tags attached. Sale items are final sale.",
      "Visit our Returns Portal at trendify.com/returns and enter your order number. You'll receive a prepaid return label via email.",
      "Absolutely! Size exchanges are complimentary and we'll even cover the return shipping for size-related exchanges.",
      "While we prefer returns in original packaging, we understand it's not always possible. Please ensure items have all original tags attached.",
    ],
    payment: [
      "We accept Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay, and Trendify gift cards.",
      "Yes! We offer a 'Buy Now, Pay Later' option through Afterpay and Klarna, allowing you to split your purchase into 4 interest-free payments.",
      "Absolutely. Our payment processing system uses bank-grade encryption and we never store your full card details.",
      "Yes, you can split your payment between a gift card and another payment method at checkout.",
    ],
    products: [
      "Yes, our comprehensive size guide is available at trendify.com/sizes. You can also chat with our style consultants for personalized fitting advice.",
      "We're committed to ethical manufacturing. 80% of our collection is made from sustainable materials, and we're working toward 100% by 2026.",
      "Definitely! Our inclusive sizing ranges from XS to 3XL in most styles, with select pieces available up to 5XL.",
      "Each garment includes specific care instructions on its tag. Generally, we recommend washing in cold water and hanging to dry for longest garment life.",
    ],
    stores: [
      "You can find your nearest store using our Store Locator at trendify.com/stores by entering your zip code or city.",
      "Yes! Our Click & Collect service allows you to reserve items online and pick them up in-store within 24 hours.",
      "While our flagship stores carry our complete collection, smaller locations may have a curated selection. Check store-specific inventory on our website.",
      "Yes, each flagship store has limited-edition 'Local Collection' pieces that celebrate the city they're located in.",
    ],
  };

  // Product recommendations based on categories
  const recommendations = {
    general: [
      {
        name: "New Arrivals Collection",
        image: "https://via.placeholder.com/60x60",
        description: "Check out our latest styles",
      },
      {
        name: "Trending Items",
        image: "https://via.placeholder.com/60x60",
        description: "See what's popular this week",
      }
    ],
    shipping: [],
    returns: [],
    payment: [],
    products: [
      {
        name: "Summer Collection",
        image: "https://via.placeholder.com/60x60",
        description: "Light fabrics for hot days",
      },
      {
        name: "Sustainable Line",
        image: "https://via.placeholder.com/60x60",
        description: "Eco-friendly fashion choices",
      }
    ],
    stores: [
      {
        name: "Flagship Store",
        image: "https://via.placeholder.com/60x60",
        description: "Visit our main location",
      }
    ]
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    // Show the bubble message after 2 seconds
    const showTimer = setTimeout(() => {
      setShowBubble(true);
    }, 2000);

    // Hide the bubble message after 5 seconds of showing
    const hideTimer = setTimeout(() => {
      setShowBubble(false);
    }, 7000);

    // Cleanup the timers
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    // Auto-welcome the user when the chat opens
    if (isChatOpen && chatMessages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        const welcomeMessage = {
          text: "Hello and welcome to Trendify! I'm your personal shopping assistant. How can I help you today?",
          isBot: true,
        };
        setChatMessages([welcomeMessage]);
        setIsTyping(false);
        
        // After welcome message, show category options
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            const categoryMessage = {
              text: "Please select a category to get started:",
              isBot: true,
              showCategories: true
            };
            setChatMessages(prev => [...prev, categoryMessage]);
            setIsTyping(false);
          }, 1000);
        }, 500);
      }, 1000);
    }
  }, [isChatOpen]);

  const handleClick = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Add user's message to chat
    const userMessage = { text: trimmedMessage, isBot: false };
    setChatMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Bot is typing effect
    setIsTyping(true);

    // Process the message to find matches
    setTimeout(() => {
      let responded = false;

      // Check if a category is selected
      if (selectedCategory) {
        const questions = categoryQuestions[selectedCategory];
        
        // Check if the message is a number corresponding to a question in the selected category
        const questionNumber = parseInt(trimmedMessage, 10);
        if (questionNumber >= 1 && questionNumber <= questions.length) {
          const selectedQuestion = questions[questionNumber - 1];
          const botResponse = {
            text: categoryAnswers[selectedCategory][questionNumber - 1],
            isBot: true,
          };
          
          setChatMessages((prev) => [...prev, botResponse]);
          
          // Show recommendations if available for this category
          if (recommendations[selectedCategory] && recommendations[selectedCategory].length > 0) {
            setTimeout(() => {
              const recMessage = {
                text: "You might also be interested in:",
                isBot: true,
                recommendations: recommendations[selectedCategory]
              };
              setChatMessages(prev => [...prev, recMessage]);
            }, 1000);
          }
          
          responded = true;
        } else {
          // Check if message matches any question in the selected category
          const matchIndex = questions.findIndex(q => 
            trimmedMessage.toLowerCase().includes(q.toLowerCase())
          );
          
          if (matchIndex !== -1) {
            const botResponse = {
              text: categoryAnswers[selectedCategory][matchIndex],
              isBot: true,
            };
            
            setChatMessages((prev) => [...prev, botResponse]);
            responded = true;
          }
        }
      }

      // If no specific category response, try to match across all categories
      if (!responded) {
        for (const catId in categoryQuestions) {
          const questions = categoryQuestions[catId];
          const matchIndex = questions.findIndex(q => 
            trimmedMessage.toLowerCase().includes(q.toLowerCase())
          );
          
          if (matchIndex !== -1) {
            const botResponse = {
              text: categoryAnswers[catId][matchIndex],
              isBot: true,
            };
            
            setChatMessages((prev) => [...prev, botResponse]);
            responded = true;
            break;
          }
        }
      }

      // If still no response, send a default message and offer categories again
      if (!responded) {
        const botResponse = {
          text: "I'm not sure I understood that. Could you please select a category or ask a different question?",
          isBot: true,
          showCategories: true
        };
        setChatMessages((prev) => [...prev, botResponse]);
      }

      setIsTyping(false);
    }, 1500);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    
    // Add user's selection to chat
    const category = categories.find(cat => cat.id === categoryId);
    const userMessage = { text: `Selected: ${category.name}`, isBot: false };
    setChatMessages((prev) => [...prev, userMessage]);
    
    // Bot is typing effect
    setIsTyping(true);
    
    setTimeout(() => {
      // Add bot's response with questions for this category
      const botResponse = {
        text: `Great choice! Here are some common questions about ${category.name.toLowerCase()}:`,
        isBot: true,
      };
      
      setChatMessages((prev) => [...prev, botResponse]);
      
      // Add numbered questions
      const questions = categoryQuestions[categoryId];
      questions.forEach((question, index) => {
        setChatMessages((prev) => [
          ...prev,
          {
            text: `${index + 1}. ${question}`,
            isBot: true,
          }
        ]);
      });
      
      // Add instruction
      setChatMessages((prev) => [
        ...prev,
        {
          text: "Please type the number of your question or ask in your own words.",
          isBot: true,
        }
      ]);
      
      setIsTyping(false);
    }, 1500);
  };

  const handleProductClick = (product) => {
    // Simulate navigating to a product page
    // In a real app, you might use navigate(`/products/${product.id}`)
    const userMessage = { text: `I want to see ${product.name}`, isBot: false };
    setChatMessages((prev) => [...prev, userMessage]);
    
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = {
        text: `Great choice! I've opened ${product.name} for you. You can continue browsing or ask me anything else about our products.`,
        isBot: true,
      };
      setChatMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 flex items-end flex-col z-50">
      {/* Chat Window */}
      {isChatOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-[32rem] mb-4 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full mr-3">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-lg">Trendify Assistant</p>
                <p className="text-xs opacity-75">Online | Fashion Expert</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-gray-200 bg-white bg-opacity-20 p-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white"
          >
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.isBot ? "justify-start" : "justify-end"
                } mb-4`}
              >
                {msg.isBot && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`${
                    msg.isBot 
                      ? "bg-white border border-gray-200" 
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  } p-3 rounded-2xl max-w-[75%] shadow-sm`}
                >
                  <p className="text-sm">{msg.text}</p>
                  
                  {/* Display category buttons if needed */}
                  {msg.showCategories && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`${category.color} text-white p-2 rounded-lg text-xs flex items-center justify-between transition-transform hover:scale-105`}
                        >
                          <div className="flex items-center">
                            {category.icon}
                            <span className="ml-2">{category.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Display product recommendations if available */}
                  {msg.recommendations && (
                    <div className="mt-3 space-y-2">
                      {msg.recommendations.map((product, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleProductClick(product)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 flex items-center hover:bg-gray-50 transition-colors"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 rounded-md object-cover mr-2"
                          />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {!msg.isBot && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ml-2 flex-shrink-0">
                    <span className="text-indigo-600 text-xs font-bold">You</span>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center bg-gray-100 rounded-full pl-4 pr-2 py-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-transparent outline-none text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity"
                disabled={isTyping}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500">Ask about products, shipping, returns or store locations</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating chatbot button and left-side bubble message */}
      <div className="flex items-center">
        {/* Left-side bubble message with slide-in animation */}
        <div
          className={`bg-white p-4 rounded-2xl shadow-lg mr-4 transition-all duration-500 ease-in-out transform ${
            showBubble
              ? "translate-x-0 opacity-100"
              : "-translate-x-20 opacity-0"
          }`}
        >
          <p className="text-sm font-medium">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Need help with your fashion choices?</span>
          </p>
        </div>

        {/* Animated Floating chatbot button with pulsing effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-300 rounded-full animate-ping opacity-30"></div>
          <button
            className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer z-10 relative"
            onClick={handleClick}
          >
            <ShoppingBag className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingChatBotButton;