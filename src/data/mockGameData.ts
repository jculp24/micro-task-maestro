
export const mockGameData = {
  swipe: {
    title: "Rate these sneaker designs",
    description: "Swipe right for designs you like, left for those you don't",
    steps: 5,
    reward: 0.25,
    items: [
      {
        id: "s1",
        title: "Urban Runner",
        description: "Modern streetwear design with reflective accents",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format",
      },
      {
        id: "s2",
        title: "Classic Retro",
        description: "Vintage-inspired colorway with suede details",
        image: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&auto=format",
      },
      {
        id: "s3",
        title: "Performance Pro",
        description: "Athletic design with enhanced support features",
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format",
      },
      {
        id: "s4",
        title: "Eco Traveler",
        description: "Sustainable materials with earth tone palette",
        image: "https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=800&auto=format",
      },
      {
        id: "s5",
        title: "Fashion Forward",
        description: "Bold design with chunky platform sole",
        image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format",
      },
    ],
  },
  
  bracket: {
    title: "Best travel destinations",
    description: "Help us rank these popular vacation spots",
    steps: 3,
    reward: 0.50,
    items: [
      {
        id: "b1",
        title: "Bali",
        description: "Island paradise with beaches and culture",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format",
      },
      {
        id: "b2",
        title: "Paris",
        description: "City of lights and romance",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format",
      },
      {
        id: "b3",
        title: "Tokyo",
        description: "Ultra-modern meets traditional",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format",
      },
      {
        id: "b4",
        title: "New York",
        description: "The city that never sleeps",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format",
      },
    ],
  },
  
  thisthat: {
    title: "Compare food packaging designs",
    description: "Which packaging would make you more likely to purchase?",
    steps: 4,
    reward: 0.15,
    comparisons: [
      {
        id: "tt1",
        question: "Which cookie packaging is more appealing?",
        left: {
          title: "Minimalist Design",
          image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format",
        },
        right: {
          title: "Colorful Design",
          image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format",
        },
      },
      {
        id: "tt2",
        question: "Which coffee packaging looks more premium?",
        left: {
          title: "Rustic Style",
          image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format",
        },
        right: {
          title: "Modern Style",
          image: "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&auto=format",
        },
      },
      {
        id: "tt3",
        question: "Which juice appears more fresh?",
        left: {
          title: "Glass Bottle",
          image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&auto=format",
        },
        right: {
          title: "Plastic Container",
          image: "https://images.unsplash.com/photo-1622597467836-f3e6c11e7acf?w=800&auto=format",
        },
      },
      {
        id: "tt4",
        question: "Which chip packaging stands out more?",
        left: {
          title: "Bold Graphics",
          image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&auto=format",
        },
        right: {
          title: "Simple Typography",
          image: "https://images.unsplash.com/photo-1613919113644-25406ac612d9?w=800&auto=format",
        },
      },
    ],
  },
  
  soundbyte: {
    title: "Rate audio jingles",
    description: "Help us choose our new brand sound",
    steps: 3,
    reward: 0.20,
    audioClips: [
      {
        id: "sb1",
        title: "Upbeat Jingle",
        description: "A cheerful, energetic sound for our brand",
        audioUrl: "audio-url-1.mp3", // These would be real audio files in a production app
      },
      {
        id: "sb2",
        title: "Professional Intro",
        description: "A serious, corporate sound for business clients",
        audioUrl: "audio-url-2.mp3",
      },
      {
        id: "sb3",
        title: "Catchy Melody",
        description: "A memorable tune designed to stick in your mind",
        audioUrl: "audio-url-3.mp3",
      },
    ],
  },
  
  higherlower: {
    title: "Guess smartphone prices",
    description: "Test your knowledge of current market prices",
    steps: 4,
    reward: 0.30,
    products: [
      {
        id: "hl1",
        name: "TechMaster Pro",
        description: "6.7\" display, 512GB, triple camera system",
        image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&auto=format",
        displayPrice: 899,
        actualPrice: 1099,
      },
      {
        id: "hl2",
        name: "UltraPhone Mini",
        description: "5.4\" display, 256GB, dual camera",
        image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&auto=format",
        displayPrice: 749,
        actualPrice: 649,
      },
      {
        id: "hl3",
        name: "Galaxy Fold X",
        description: "Foldable display, 512GB, quad camera",
        image: "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=800&auto=format",
        displayPrice: 1499,
        actualPrice: 1799,
      },
      {
        id: "hl4",
        name: "Budget King",
        description: "6.5\" display, 128GB, triple camera",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02ff9?w=800&auto=format",
        displayPrice: 499,
        actualPrice: 349,
      },
    ],
  },
  
  highlight: {
    title: "Highlight what you like about this ad",
    description: "Give feedback on our new campaign",
    steps: 3,
    reward: 0.35,
    images: [
      {
        id: "h1",
        prompt: "What parts of this ad catch your attention?",
        image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&auto=format",
      },
      {
        id: "h2",
        prompt: "Which elements of this design do you find appealing?",
        image: "https://images.unsplash.com/photo-1618004912476-29818d81ae2e?w=800&auto=format",
      },
      {
        id: "h3",
        prompt: "What do you dislike about this packaging design?",
        image: "https://images.unsplash.com/photo-1556760891-86b600ac3be7?w=800&auto=format",
      },
    ],
  },
};
