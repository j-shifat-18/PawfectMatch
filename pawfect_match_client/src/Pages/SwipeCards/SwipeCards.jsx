import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../Hooks/useAuth';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const Typewriter = ({ text }) => (
  <span className="font-bold text-xl text-gray-900 tracking-wide">
    {text.split("").map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.04 }}
      >
        {char}
      </motion.span>
    ))}
  </span>
);

const cardVariants = {
  initial: (direction) => ({
    y: 40,
    rotate: direction === "right" ? 8 : -8,
    opacity: 0,
    scale: 0.95,
  }),
  animate: {
    y: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: (direction) => ({
    x: direction === "right" ? 350 : -350,
    rotate: direction === "right" ? 25 : -25,
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.35 }
  }),
};

const SwipeCards = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(0);
  const [direction, setDirection] = useState("right");
  const [isDragging, setIsDragging] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [remainingCards, setRemainingCards] = useState(0);
  const [shouldRestack, setShouldRestack] = useState(false);
  const [showAIMatches, setShowAIMatches] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(true); // Assume they have preferences initially

  // Fetch cards from backend
  const fetchCards = async (forceRefresh = false) => {
    try {
      if (!user?.email) {
        toast.error('Please login to view cards');
        return;
      }

      const refreshParam = forceRefresh ? '&refresh=true' : '';
      const response = await axiosPublic.get(`/swipecards?userId=${user.uid}${refreshParam}`);
      
      if (response.data.cards && response.data.cards.length > 0) {
        setCards(response.data.cards);
        setActiveCard(0);
        setRemainingCards(response.data.remainingCards);
        setShouldRestack(response.data.shouldRestack);
      } else {
        toast.error('No cards available');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load cards');
    }
  };

  // Handle swipe
  const handleSwipe = async (direction) => {
    if (!cards[activeCard] || !user?.email) return;

    try {
      const response = await axiosSecure.post('/swipecards/swipe', {
        userId: user.uid,
        cardId: cards[activeCard]._id,
        direction: direction
      });

      // Show feedback
      if (direction === 'right' && response.data.addedToFavorites) {
        toast.success('Added to favorites! ❤️');
      }

      // Update remaining cards count
      setRemainingCards(response.data.remainingCards);
      setShouldRestack(response.data.shouldRestack);

      // Remove current card from stack
      setCards(prev => prev.filter((_, index) => index !== activeCard));

              // Move to next card
        setCardKey(prev => prev + 1);
        setTimeout(() => {
          setActiveCard(prev => Math.min(prev, cards.length - 2));
        }, 350);

    } catch (error) {
      console.error('Error handling swipe:', error);
      toast.error('Failed to process swipe');
    }
  };

  const swipeCard = (dir) => {
    setDirection(dir);
    handleSwipe(dir);
  };

  // Get AI matches
  const getAIMatches = async () => {
    try {
      if (!user?.email) {
        toast.error('Please login to use AI matching');
        return;
      }

      setAiLoading(true);
      const response = await axiosPublic.get(`/ai/matches?userId=${user.email}`);
      
      if (response.data.success) {
        setAiMatches(response.data.matchedPets);
        setShowAIMatches(true);
        toast.success(`Found ${response.data.matchedPets.length} perfect matches!`);
      } else {
        // Handle specific error for missing preferences
        if (response.data.error && response.data.error.includes('preferences not found')) {
          showPreferencesAlert();
        } else {
          toast.error(response.data.error || 'Failed to get AI matches');
        }
      }
          } catch (error) {
        console.error('Error getting AI matches:', error);
        // Check if it's a 404 error (preferences not found)
        if (error.response?.status === 404) {
          setHasPreferences(false);
          showPreferencesAlert();
        } else {
          toast.error('Failed to get AI matches');
        }
      } finally {
        setAiLoading(false);
      }
    };

  // Show preferences alert
  const showPreferencesAlert = () => {
    Swal.fire({
      title: 'Set Your Preferences First! 🐾',
      html: `
        <div class="text-left">
          <p class="mb-4">To get personalized AI matches, you need to set your pet preferences first.</p>
          <div class="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 class="font-semibold text-blue-800 mb-2">What you can set:</h4>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• Preferred pet species (dogs, cats, etc.)</li>
              <li>• Size preferences (small, medium, large)</li>
              <li>• Activity level compatibility</li>
              <li>• Living situation (apartment, house, etc.)</li>
              <li>• Experience level with pets</li>
              <li>• Budget considerations</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Set Preferences Now',
      cancelButtonText: 'Maybe Later',
      confirmButtonColor: '#FF8904',
      cancelButtonColor: '#6B7280',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to user profile to set preferences
        window.location.href = `/dashboard/profile/${user.email}`;
      }
    });
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -120) {
      swipeCard("left");
    } else if (info.offset.x > 120) {
      swipeCard("right");
    }
    setIsDragging(false);
  };

  // Fetch cards on component mount
  useEffect(() => {
    if (user?.email) {
      fetchCards();
    }
  }, [user]);

  // Background preloading when cards get low
  useEffect(() => {
    if (remainingCards <= 4 && user?.email) {
      // Silently preload new cards in background
      const preloadCards = async () => {
        try {
          await axiosPublic.get(`/swipecards?userId=${user.uid}`);
        } catch (error) {
          console.log('Background preload failed:', error);
        }
      };
      preloadCards();
    }
  }, [remainingCards, user]);



  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #fde68a 60%, #fdba74 100%)"
        }}>
        <div className="text-center">
          <p className="text-gray-600">Please login to view cards</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #fde68a 60%, #fdba74 100%)"
        }}>
        <div className="text-center">
          <div className="mb-4">
            <span className="text-6xl">🐾</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No pets available for swiping</h3>
          <p className="text-gray-600 mb-4">Check back later for new adoption posts!</p>
          <button 
            onClick={fetchCards}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[activeCard];
  if (!currentCard) return null;

  return (
    <div
      className=" flex items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #fde68a 60%, #fdba74 100%)"
      }}
    >
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl font-extrabold tracking-tight text-black drop-shadow-sm">
              Pet Cards
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold tracking-wide shadow-sm">
              Swipe & Match
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm text-gray-500 font-medium">
              Discover your next furry friend!
            </p>
            <button
              onClick={() => fetchCards(true)}
              className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition-colors"
              title="Get fresh cards"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center ">
          <div className="relative w-full h-56 flex items-center justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={cardKey + activeCard}
                custom={direction}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                className="absolute rounded-xl w-full h-56 bg-cover bg-center border-4 border-orange-200 cursor-grab active:cursor-grabbing mb-2"
                style={{
                  backgroundImage: (() => {
                    const imageUrl = currentCard.images?.[0] || currentCard.petInfo?.images?.[0];
                    return imageUrl ? `url(${imageUrl})` : "url('https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400')";
                  })(),
                  touchAction: 'pan-x',
                }}
              />
            </AnimatePresence>
          </div>
          <div className="w-full flex flex-col items-center mb-2">
            <Typewriter text={currentCard.petInfo?.name || "Unknown"} />
            <p className="text-sm text-gray-700 mt-1">
              {currentCard.petInfo?.breed || "Unknown"} • {currentCard.petInfo?.gender || "Unknown"}
            </p>
            <p className="text-xs text-gray-500">{currentCard.petInfo?.description || "No description available"}</p>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium mt-2">
              {currentCard.petInfo?.age || "Unknown age"}
            </span>
          </div>
          <div className="flex justify-center gap-8 mt-4 w-full">
            <button
              className="bg-orange-100 hover:bg-red-200 text-red-500 rounded-full p-3 shadow transition"
              onClick={() => swipeCard("left")}
              aria-label="Pass"
              disabled={isDragging}
            >
              &#10006;
            </button>
            <button
              className="bg-orange-100 hover:bg-green-200 text-green-500 rounded-full p-3 shadow transition"
              onClick={() => swipeCard("right")}
              aria-label="Like"
              disabled={isDragging}
            >
              &#10084;
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {cards.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${activeCard === i ? "bg-orange-400" : "bg-gray-300/70"}`}
              ></span>
            ))}
          </div>
          <div className="text-gray-400 text-xs mt-2 flex items-center gap-2">
            <span className="text-lg">&#128072;</span> Grab or tap buttons to swipe
          </div>
          
          {/* AI Matching Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            {hasPreferences ? (
              <>
                <div className="text-center mb-2">
                  <p className="text-xs text-gray-500">
                    💡 Set your preferences in profile for personalized AI matches
                  </p>
                </div>
                <button
                  onClick={getAIMatches}
                  disabled={aiLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  title="Get AI-powered pet recommendations based on your preferences"
                >
                  {aiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      AI is finding your perfect matches...
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🤖</span>
                      Use AI to Match
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-2">
                  <p className="text-xs text-orange-600 font-medium">
                    ⚠️ Preferences needed for AI matching
                  </p>
                </div>
                <button
                  onClick={showPreferencesAlert}
                  className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-500 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                  title="Set your preferences to enable AI matching"
                >
                  <span className="text-lg">⚙️</span>
                  Set Preferences First
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* AI Matches Modal */}
      {showAIMatches && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  AI Matches
                </h2>
                <button
                  onClick={() => setShowAIMatches(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {aiMatches.map((match, index) => (
                  <div key={match._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="relative h-48 mb-4">
                      <img
                        src={match.images?.[0] || match.petInfo?.images?.[0] || "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"}
                        alt={match.petInfo?.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        #{index + 1} Match
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {match.petInfo?.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {match.petInfo?.breed || "Unknown"} • {match.petInfo?.gender || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {match.petInfo?.age || "Unknown"} years old
                    </p>
                    <p className="text-sm text-gray-700 mb-4">
                      {match.description || "No description available"}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Add to favorites
                          handleSwipe("right");
                          setShowAIMatches(false);
                        }}
                        className="flex-1 bg-primary text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                      >
                        ❤️ Like
                      </button>
                      <button
                        onClick={() => setShowAIMatches(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  These pets were selected by AI based on your preferences. 
                  Set your preferences in your profile for better matches!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeCards;
