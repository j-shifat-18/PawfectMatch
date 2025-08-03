import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../Hooks/useAuth';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { toast } from 'react-toastify';

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
  
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(0);
  const [direction, setDirection] = useState("right");
  const [isDragging, setIsDragging] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remainingCards, setRemainingCards] = useState(0);
  const [shouldRestack, setShouldRestack] = useState(false);

  // Fetch cards from backend
  const fetchCards = async (forceRefresh = false) => {
    try {
      if (!user?.email) {
        toast.error('Please login to view cards');
        return;
      }

      setLoading(true);
      const refreshParam = forceRefresh ? '&refresh=true' : '';
      const response = await axiosPublic.get(`/swipecards?userId=${user.uid}${refreshParam}`);
      
      if (response.data.cards && response.data.cards.length > 0) {
        console.log('Cards received:', response.data.cards);
        console.log('First card structure:', response.data.cards[0]);
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
    } finally {
      setLoading(false);
    }
  };

  // Handle swipe
  const handleSwipe = async (direction) => {
    if (!cards[activeCard] || !user?.email) return;

    try {
      const response = await axiosPublic.post('/swipecards/swipe', {
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

      // If we need to restack or no more cards, fetch new ones
              if (response.data.shouldRestack || response.data.remainingCards === 0) {
          setTimeout(() => {
            fetchCards(false);
          }, 500);
        } else {
        // Move to next card
        setCardKey(prev => prev + 1);
        setTimeout(() => {
          setActiveCard(prev => Math.min(prev, cards.length - 2));
        }, 350);
      }

    } catch (error) {
      console.error('Error handling swipe:', error);
      toast.error('Failed to process swipe');
    }
  };

  const swipeCard = (dir) => {
    setDirection(dir);
    handleSwipe(dir);
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
    fetchCards();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #fde68a 60%, #fdba74 100%)"
        }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cards...</p>
        </div>
      </div>
    );
  }

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
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #fde68a 60%, #fdba74 100%)"
      }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
              Pet Cards
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold tracking-wide shadow-sm">
              Swipe & Match
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">
            Discover your next furry friend!
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {remainingCards} cards remaining
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
        <div className="bg-white rounded-2xl shadow-2xl p-5 flex flex-col items-center gap-4">
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
                    console.log('Image URL for card:', imageUrl);
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
        </div>
      </div>
    </div>
  );
};

export default SwipeCards;
