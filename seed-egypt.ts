import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Initialize Firebase
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const egyptPlaces = [
  {
    "name": "Giza Pyramids Complex",
    "description": "The Great Pyramid of Giza is the oldest and largest of the pyramids in the Giza pyramid complex. It is the oldest of the Seven Wonders of the Ancient World and the only one still largely intact.",
    "category": "Historic",
    "budget": "Medium",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.9792,
        "lng": 31.1342
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.9,
    "tags": [
      "pyramids",
      "ancient",
      "pharaohs",
      "desert",
      "wonders"
    ],
    "accessibility": [
      "Wheelchair accessible in some areas",
      "Restrooms"
    ]
  },
  {
    "name": "The Great Sphinx of Giza",
    "description": "A limestone statue of a reclining sphinx with the head of a human and the body of a lion. It is the largest monolith statue in the world, standing 73 metres long and 20 metres tall.",
    "category": "Historic",
    "budget": "Medium",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.9753,
        "lng": 31.1376
      }
    },
    "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "sphinx",
      "ancient",
      "limestone",
      "pharaohs",
      "iconic"
    ],
    "accessibility": [
      "Guided tours available",
      "Restrooms nearby"
    ]
  },
  {
    "name": "Egyptian Museum Cairo",
    "description": "The Egyptian Museum in Cairo is home to an extensive collection of ancient Egyptian antiquities. It has 136,000 items, with a representative amount on display. The centerpiece is the treasure of Tutankhamun.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0478,
        "lng": 31.2336
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "museum",
      "artifacts",
      "tutankhamun",
      "mummies",
      "history"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Elevators",
      "Guided tours available"
    ]
  },
  {
    "name": "Khan el-Khalili",
    "description": "Khan el-Khalili is a famous bazaar and souq in the historic center of Cairo. Established in the Mamluk era, it is one of the oldest and largest bazaars in the Arab world, filled with shops selling spices, gold, and crafts.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0478,
        "lng": 31.2623
      }
    },
    "image": "https://images.unsplash.com/photo-1553914710-6a71b75b2bc1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "market",
      "shopping",
      "culture",
      "spices",
      "souvenirs"
    ],
    "accessibility": [
      "Crowded",
      "Uneven pavement"
    ]
  },
  {
    "name": "Cairo Citadel",
    "description": "A medieval Islamic fortification built by Saladin on a promontory of the Muqattam hill. Inside stands the stunning Muhammad Ali Mosque with its Ottoman-style domes. Panoramic views over Cairo make it unmissable.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.029,
        "lng": 31.2599
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "citadel",
      "mosque",
      "saladin",
      "medieval",
      "panorama"
    ],
    "accessibility": [
      "Wheelchair accessible entrance",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Al-Azhar Mosque",
    "description": "One of the world's oldest and most prestigious universities and mosques, founded in 970 AD. Al-Azhar is the chief centre of Islamic learning worldwide and an architectural masterpiece of Islamic design.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0459,
        "lng": 31.2626
      }
    },
    "image": "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "mosque",
      "islamic",
      "history",
      "religion",
      "architecture"
    ],
    "accessibility": [
      "Flat terrain",
      "Restrooms available"
    ]
  },
  {
    "name": "Coptic Cairo",
    "description": "An area in Old Cairo containing many of the oldest churches in Egypt. Key sites include the Hanging Church, Ben Ezra Synagogue, and Coptic Museum — all within a small walled compound that dates back to Roman times.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0051,
        "lng": 31.2298
      }
    },
    "image": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "coptic",
      "church",
      "christian",
      "history",
      "roman"
    ],
    "accessibility": [
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "Al-Azhar Park",
    "description": "A beautifully landscaped urban park in historic Cairo offering stunning panoramic views over the city skyline and the Citadel. Built on a former Ayyubid rubble heap, it is now one of Cairo's most visited green spaces.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0433,
        "lng": 31.2668
      }
    },
    "image": "https://images.unsplash.com/photo-1592609931195-7c7a3d8a2cf9?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "park",
      "garden",
      "panorama",
      "relaxation",
      "family"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Saqqara Step Pyramid",
    "description": "The Pyramid of Djoser at Saqqara is the world's oldest monumental stone structure, built around 2650 BC by the architect Imhotep. Predating the Great Pyramid by nearly a century, it marks the dawn of pyramid construction.",
    "category": "Historic",
    "budget": "Medium",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.8713,
        "lng": 31.2165
      }
    },
    "image": "https://images.unsplash.com/photo-1603193010847-e26b52955de3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "step pyramid",
      "djoser",
      "oldest",
      "archaeology",
      "ancient"
    ],
    "accessibility": [
      "Parking available",
      "Restrooms",
      "Guided tours available"
    ]
  },
  {
    "name": "Memphis Open Air Museum",
    "description": "Memphis was the ancient capital of Egypt and this open-air museum preserves its most important relics, including a massive fallen limestone statue of Ramesses II and a beautiful alabaster sphinx.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.8442,
        "lng": 31.2522
      }
    },
    "image": "https://images.unsplash.com/photo-1600520611035-84157ad4084d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "memphis",
      "ramesses",
      "ancient capital",
      "statues",
      "open air"
    ],
    "accessibility": [
      "Flat terrain",
      "Guided tours available"
    ]
  },
  {
    "name": "Karnak Temple",
    "description": "The Karnak Temple Complex is a vast mix of temples, chapels, pylons, and obelisks dedicated to Amun-Ra. The incredible Hypostyle Hall with 134 massive columns is one of the most awe-inspiring spaces in ancient architecture.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.7188,
        "lng": 32.6573
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.9,
    "tags": [
      "temple",
      "ancient",
      "columns",
      "obelisks",
      "amun"
    ],
    "accessibility": [
      "Flat terrain",
      "Guided tours available"
    ]
  },
  {
    "name": "Luxor Temple",
    "description": "A large ancient Egyptian temple complex built largely by Amenhotep III and Ramesses II. Remarkably, a functioning mosque was built within its ruins. Stunning when lit up at night, it is one of Egypt's most photogenic sites.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.6994,
        "lng": 32.6392
      }
    },
    "image": "https://images.unsplash.com/photo-1600520611035-84157ad4084d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "temple",
      "luxor",
      "ramesses",
      "nile",
      "night lights"
    ],
    "accessibility": [
      "Guided tours available",
      "Restrooms",
      "Parking available"
    ]
  },
  {
    "name": "Valley of the Kings",
    "description": "The Valley of the Kings is where pharaohs of the New Kingdom were buried. Over 63 tombs have been discovered, including Tutankhamun's. The elaborate wall paintings depicting the afterlife are extraordinary.",
    "category": "Historic",
    "budget": "Medium",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.7402,
        "lng": 32.6014
      }
    },
    "image": "https://images.unsplash.com/photo-1600520611035-84157ad4084d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "tombs",
      "pharaohs",
      "underground",
      "tutankhamun",
      "paintings"
    ],
    "accessibility": [
      "Electric carts available"
    ]
  },
  {
    "name": "Hatshepsut Temple",
    "description": "The mortuary temple of Queen Hatshepsut at Deir el-Bahari is one of Egypt's most extraordinary temples. Its unique terraced architecture is built into a limestone cliff, and vivid reliefs depict the famous expedition to Punt.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.738,
        "lng": 32.6065
      }
    },
    "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "hatshepsut",
      "queen",
      "cliff temple",
      "reliefs",
      "west bank"
    ],
    "accessibility": [
      "Parking available",
      "Restrooms",
      "Guided tours available"
    ]
  },
  {
    "name": "Colossi of Memnon",
    "description": "Two massive stone statues of Pharaoh Amenhotep III stand 18 metres tall on the west bank of Luxor. They have stood for over 3,400 years and are free to visit. Best seen at sunrise when the golden light is magical.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.7208,
        "lng": 32.6103
      }
    },
    "image": "https://images.unsplash.com/photo-1603193010847-e26b52955de3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "statues",
      "colossal",
      "amenhotep",
      "west bank",
      "sunrise"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Valley of the Queens",
    "description": "A valley on the west bank of Luxor where queens, princes, and nobles of the New Kingdom were buried. The tomb of Nefertari is considered one of the finest in Egypt, featuring beautifully preserved and vividly coloured wall paintings.",
    "category": "Historic",
    "budget": "Medium",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.7257,
        "lng": 32.5941
      }
    },
    "image": "https://images.unsplash.com/photo-1600520611035-84157ad4084d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "nefertari",
      "queens",
      "tombs",
      "paintings",
      "west bank"
    ],
    "accessibility": [
      "Guided tours available",
      "Parking available"
    ]
  },
  {
    "name": "Luxor Museum",
    "description": "A small but world-class museum on the east bank of the Nile in Luxor. Its focused collection of New Kingdom artifacts, beautifully displayed, includes mummies, statues, and objects from Tutankhamun's era.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.701,
        "lng": 32.6399
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "museum",
      "new kingdom",
      "mummies",
      "statues",
      "artifacts"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Restrooms",
      "Guided tours available"
    ]
  },
  {
    "name": "Hot Air Balloon Ride Luxor",
    "description": "Floating over the west bank of Luxor at sunrise in a hot air balloon is one of Egypt's most unforgettable experiences. Drift over the Valley of the Kings, Hatshepsut Temple, and the green ribbon of the Nile at dawn.",
    "category": "Adventure",
    "budget": "High",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.75,
        "lng": 32.59
      }
    },
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.9,
    "tags": [
      "balloon",
      "sunrise",
      "aerial",
      "adventure",
      "nile views"
    ],
    "accessibility": [
      "Physical fitness required",
      "Not suitable for wheelchair users"
    ]
  },
  {
    "name": "Medinet Habu Temple",
    "description": "The mortuary temple of Ramesses III at Medinet Habu is one of the best-preserved temples on the west bank of Luxor. Its massive pylons are covered with vivid battle scenes, and the temple retains original paint in many places.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.7196,
        "lng": 32.5998
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "ramesses III",
      "battle scenes",
      "temple",
      "west bank",
      "painted"
    ],
    "accessibility": [
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Luxor Corniche and Nile Walk",
    "description": "The palm-lined riverside promenade in Luxor is one of Egypt's most atmospheric evening walks. Stroll past feluccas, horse carriages, and glittering temples reflected in the Nile as the sun sets over the west bank.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.698,
        "lng": 32.639
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "nile",
      "walk",
      "sunset",
      "felucca",
      "promenade"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Restaurants nearby"
    ]
  },
  {
    "name": "Abu Simbel Temples",
    "description": "Two massive rock-cut temples built by Ramesses II. The main temple features four colossal 20-metre statues. Remarkably, the entire complex was relocated in the 1960s to save it from the rising waters of Lake Nasser.",
    "category": "Historic",
    "budget": "High",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 22.3372,
        "lng": 31.6258
      }
    },
    "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.9,
    "tags": [
      "ramesses",
      "temple",
      "colossal",
      "monument",
      "UNESCO"
    ],
    "accessibility": [
      "Wheelchair accessible paths"
    ]
  },
  {
    "name": "Philae Temple",
    "description": "Dedicated to the goddess Isis, this Ptolemaic temple complex sits on an island in the Nile near Aswan. Reached by boat, the setting is magical — especially during the evening Sound and Light Show.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.0252,
        "lng": 32.8839
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "isis",
      "island",
      "boat",
      "ptolemaic",
      "sound and light"
    ],
    "accessibility": [
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "Aswan High Dam",
    "description": "Built between 1960-1970, the Aswan High Dam is one of the great engineering achievements of the 20th century. It created Lake Nasser, controls Nile flooding, and generates major hydroelectric power for Egypt.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 23.9708,
        "lng": 32.8776
      }
    },
    "image": "https://images.unsplash.com/photo-1592609931195-7c7a3d8a2cf9?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "dam",
      "engineering",
      "lake nasser",
      "hydroelectric",
      "modern"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Parking available",
      "Guided tours available"
    ]
  },
  {
    "name": "Nubian Village Aswan",
    "description": "Colorful villages on the banks of the Nile where the indigenous Nubian people have lived for millennia. Reachable by felucca boat, you'll find vibrant painted houses, welcoming families, homemade food, and rich culture.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.0889,
        "lng": 32.8998
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "nubian",
      "village",
      "culture",
      "felucca",
      "colorful"
    ],
    "accessibility": [
      "Restrooms"
    ]
  },
  {
    "name": "Kom Ombo Temple",
    "description": "An unusual double temple dedicated to two gods: Sobek the crocodile god and Horus. Situated on a bend in the Nile with beautiful river views, it also houses an on-site museum displaying ancient mummified crocodiles.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.4526,
        "lng": 32.9286
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "sobek",
      "crocodile",
      "double temple",
      "nile views",
      "ptolemaic"
    ],
    "accessibility": [
      "Parking available",
      "Restrooms",
      "Guided tours available"
    ]
  },
  {
    "name": "Edfu Temple of Horus",
    "description": "The best-preserved ancient temple in Egypt, dedicated to Horus. Built in the Ptolemaic period, its walls are covered in detailed hieroglyphic texts and reliefs depicting the conflict between Horus and Set.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.9781,
        "lng": 32.8739
      }
    },
    "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "horus",
      "best preserved",
      "hieroglyphs",
      "ptolemaic",
      "mythology"
    ],
    "accessibility": [
      "Guided tours available",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Felucca Ride on the Nile",
    "description": "Sailing on a traditional felucca (wooden sailboat) on the Nile around Aswan at sunset is one of Egypt's most relaxing experiences. Drift past Elephantine Island and the west bank hills while the light turns golden.",
    "category": "Nature",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.091,
        "lng": 32.8979
      }
    },
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "felucca",
      "nile",
      "sailing",
      "sunset",
      "relaxation"
    ],
    "accessibility": [
      "Life jackets provided"
    ]
  },
  {
    "name": "Elephantine Island Aswan",
    "description": "One of the oldest inhabited sites in Egypt, Elephantine Island sits in the middle of the Nile at Aswan. It hosts Nubian villages, a local museum with ancient artefacts, and beautiful gardens along the river.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.0905,
        "lng": 32.8891
      }
    },
    "image": "https://images.unsplash.com/photo-1592609931195-7c7a3d8a2cf9?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "island",
      "nubian",
      "museum",
      "history",
      "nile"
    ],
    "accessibility": [
      "Boat access required"
    ]
  },
  {
    "name": "Ras Mohammed National Park",
    "description": "Egypt's first national park at the southern tip of Sinai is one of the world's top diving destinations. Dramatic coral walls, mangrove forests, sharks, rays, and extraordinary marine biodiversity in two stunning bays.",
    "category": "Nature",
    "budget": "Medium",
    "location": {
      "city": "Sharm El-Sheikh",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.7312,
        "lng": 34.244
      }
    },
    "image": "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.9,
    "tags": [
      "diving",
      "snorkeling",
      "coral reefs",
      "red sea",
      "marine life"
    ],
    "accessibility": [
      "Boat access"
    ]
  },
  {
    "name": "Naama Bay Beach",
    "description": "The main beach strip of Sharm El-Sheikh, Naama Bay is lined with hotels, restaurants, and water sports operators. Its calm clear turquoise water and sandy shore make it ideal for swimming, snorkeling, and relaxing.",
    "category": "Beach",
    "budget": "Medium",
    "location": {
      "city": "Sharm El-Sheikh",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.9158,
        "lng": 34.3299
      }
    },
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "beach",
      "swimming",
      "red sea",
      "snorkeling",
      "resort"
    ],
    "accessibility": [
      "Wheelchair accessible beach",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Tiran Island Sharm",
    "description": "A small uninhabited island at the entrance to the Gulf of Aqaba, famous for its four spectacular dive sites with some of the richest coral reefs in the Red Sea. A must-do day trip for divers and snorkelers.",
    "category": "Adventure",
    "budget": "Medium",
    "location": {
      "city": "Sharm El-Sheikh",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.9479,
        "lng": 34.5462
      }
    },
    "image": "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "diving",
      "island",
      "coral",
      "snorkeling",
      "red sea"
    ],
    "accessibility": [
      "Boat access required"
    ]
  },
  {
    "name": "Sharks Bay Sharm",
    "description": "A quieter alternative to Naama Bay, Sharks Bay offers pristine beaches, excellent house reef snorkeling, and a relaxed atmosphere. The reef drops close to shore making it ideal for snorkelers and beginner divers.",
    "category": "Beach",
    "budget": "Medium",
    "location": {
      "city": "Sharm El-Sheikh",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.95,
        "lng": 34.3083
      }
    },
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "beach",
      "snorkeling",
      "reef",
      "relaxation",
      "quiet"
    ],
    "accessibility": [
      "Restrooms",
      "Restaurants nearby"
    ]
  },
  {
    "name": "Hurghada Red Sea Beach",
    "description": "Hurghada is a major beach resort city on the Red Sea coast known for its warm blue waters, sandy beaches, and excellent diving. Access to colorful marine life including dolphins, sea turtles, and vibrant coral reefs.",
    "category": "Beach",
    "budget": "Medium",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.2579,
        "lng": 33.8116
      }
    },
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "beach",
      "red sea",
      "diving",
      "snorkeling",
      "dolphins"
    ],
    "accessibility": [
      "Wheelchair accessible beach",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Giftun Islands Hurghada",
    "description": "Two pristine uninhabited islands southeast of Hurghada protected within a national park. Famous for their white sand beaches, crystal-clear waters, and spectacular coral reefs, they are accessible only by boat.",
    "category": "Nature",
    "budget": "Medium",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.181,
        "lng": 33.927
      }
    },
    "image": "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "island",
      "snorkeling",
      "diving",
      "coral",
      "beach"
    ],
    "accessibility": [
      "Boat access required",
      "Life jackets provided"
    ]
  },
  {
    "name": "El Gouna Resort Town",
    "description": "A private lagoon resort town north of Hurghada built across islands connected by waterways. One of Egypt's most sophisticated holiday destinations with upscale hotels, golf, water sports, and a charming downtown.",
    "category": "City",
    "budget": "High",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.3955,
        "lng": 33.68
      }
    },
    "image": "https://images.unsplash.com/photo-1592609931195-7c7a3d8a2cf9?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "resort",
      "lagoon",
      "luxury",
      "golf",
      "water sports"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Hurghada Marina",
    "description": "A vibrant marina area lined with restaurants, cafes, yachts, and shops. The Marina Boulevard is ideal for evening strolls and dining with views over the Red Sea. Boat trips and dolphin-watching tours depart from here.",
    "category": "City",
    "budget": "Medium",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.2466,
        "lng": 33.828
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "marina",
      "restaurants",
      "boats",
      "evening",
      "seafood"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Restaurants nearby",
      "Restrooms"
    ]
  },
  {
    "name": "Dahab Blue Hole",
    "description": "A world-famous 130-metre deep underwater sinkhole on the Red Sea coast. The surrounding reef is spectacular even for snorkelers. Dahab itself is a relaxed bohemian beach town beloved by divers and backpackers.",
    "category": "Adventure",
    "budget": "Low",
    "location": {
      "city": "Dahab",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.5711,
        "lng": 34.539
      }
    },
    "image": "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "diving",
      "freediving",
      "red sea",
      "snorkeling",
      "adventure"
    ],
    "accessibility": [
      "Restrooms",
      "Restaurants nearby"
    ]
  },
  {
    "name": "Dahab Lagoon",
    "description": "A large shallow-water lagoon ideal for windsurfing and kitesurfing. The consistent wind and calm flat-water conditions make it one of Egypt's premier kitesurfing spots, attracting riders from around the world.",
    "category": "Adventure",
    "budget": "Medium",
    "location": {
      "city": "Dahab",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.4954,
        "lng": 34.512
      }
    },
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "kitesurfing",
      "windsurfing",
      "lagoon",
      "water sports",
      "wind"
    ],
    "accessibility": [
      "Restrooms",
      "Equipment rental available"
    ]
  },
  {
    "name": "Canyon Dive Site Dahab",
    "description": "One of Dahab's most dramatic dive sites, Canyon is an underwater gorge that drops to 52 metres. The journey through the narrow channel and out into open water is a thrilling experience for advanced divers.",
    "category": "Adventure",
    "budget": "Medium",
    "location": {
      "city": "Dahab",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.53,
        "lng": 34.518
      }
    },
    "image": "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "diving",
      "canyon",
      "advanced",
      "underwater",
      "red sea"
    ],
    "accessibility": [
      "Diving experience required"
    ]
  },
  {
    "name": "Mount Sinai",
    "description": "Mount Sinai, known as Jabal Musa, is where Moses received the Ten Commandments. The predawn hike to 2,285 metres rewards visitors with one of the most breathtaking sunrises imaginable over a vast sea of mountains.",
    "category": "Mountain",
    "budget": "Low",
    "location": {
      "city": "St. Catherine",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.5394,
        "lng": 33.975
      }
    },
    "image": "https://images.unsplash.com/photo-1541273860828-e09e2f7a3c9b?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "hiking",
      "sunrise",
      "religious",
      "mountain",
      "sinai"
    ],
    "accessibility": [
      "Strenuous hike",
      "Camel rides available partway"
    ]
  },
  {
    "name": "St. Catherine's Monastery",
    "description": "One of the oldest working Christian monasteries in the world, built in the 6th century at the foot of Mount Sinai. It houses an extraordinary collection of ancient manuscripts, icons, and the famous Burning Bush.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "St. Catherine",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.5563,
        "lng": 33.9759
      }
    },
    "image": "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "monastery",
      "christian",
      "ancient",
      "manuscripts",
      "burning bush"
    ],
    "accessibility": [
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "Colored Canyon Sinai",
    "description": "A stunning natural rock formation in the Sinai desert featuring narrow slot canyons with walls layered in vivid shades of red, orange, yellow, and purple. One of Egypt's most photogenic natural landscapes.",
    "category": "Nature",
    "budget": "Medium",
    "location": {
      "city": "Nuweiba",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.2612,
        "lng": 34.6567
      }
    },
    "image": "https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "canyon",
      "desert",
      "colors",
      "photography",
      "hiking"
    ],
    "accessibility": [
      "4x4 vehicles required",
      "Guide required"
    ]
  },
  {
    "name": "Nuweiba Beach",
    "description": "A quiet coastal town on the Gulf of Aqaba, Nuweiba has a relaxed atmosphere and stunning views of the Saudi and Jordanian mountains across the water. Popular with backpackers for its natural beauty and coral reefs.",
    "category": "Beach",
    "budget": "Low",
    "location": {
      "city": "Nuweiba",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.9727,
        "lng": 34.6533
      }
    },
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "beach",
      "gulf of aqaba",
      "quiet",
      "snorkeling",
      "backpacker"
    ],
    "accessibility": [
      "Restrooms",
      "Restaurants nearby"
    ]
  },
  {
    "name": "Taba Heights Resort",
    "description": "A resort area on the northernmost tip of the Gulf of Aqaba, Taba Heights offers luxury hotels with views of four countries: Egypt, Israel, Jordan, and Saudi Arabia — a unique geographical experience.",
    "category": "City",
    "budget": "High",
    "location": {
      "city": "Taba",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.4928,
        "lng": 34.8977
      }
    },
    "image": "https://images.unsplash.com/photo-1592609931195-7c7a3d8a2cf9?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "resort",
      "luxury",
      "four countries",
      "gulf of aqaba",
      "unique"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Bibliotheca Alexandrina",
    "description": "A major library and cultural center on the Mediterranean shore of Alexandria, it is a tribute to the ancient Library of Alexandria. It houses millions of books, multiple museums, a planetarium, and hosts international events.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Alexandria",
      "country": "Egypt",
      "coordinates": {
        "lat": 31.2089,
        "lng": 29.9092
      }
    },
    "image": "https://images.unsplash.com/photo-1581111111111-111111111111?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "library",
      "architecture",
      "culture",
      "mediterranean",
      "planetarium"
    ],
    "accessibility": [
      "Fully wheelchair accessible",
      "Elevators",
      "Restrooms"
    ]
  },
  {
    "name": "Alexandria Corniche",
    "description": "A stunning 20-kilometre seafront promenade along the Mediterranean. The heart of Alexandria's social life, it offers fresh seafood restaurants, views of the Qaitbay Citadel, and the unique Mediterranean-Egyptian atmosphere.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Alexandria",
      "country": "Egypt",
      "coordinates": {
        "lat": 31.1975,
        "lng": 29.8956
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "seafront",
      "mediterranean",
      "walk",
      "sunset",
      "seafood"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Restrooms",
      "Restaurants nearby"
    ]
  },
  {
    "name": "Qaitbay Citadel Alexandria",
    "description": "A 15th-century defensive fortress built on the site of the ancient Lighthouse of Alexandria. One of the Seven Wonders of the Ancient World once stood here. The citadel offers sweeping views over the Mediterranean.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Alexandria",
      "country": "Egypt",
      "coordinates": {
        "lat": 31.2138,
        "lng": 29.8851
      }
    },
    "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "citadel",
      "lighthouse",
      "medieval",
      "mediterranean",
      "views"
    ],
    "accessibility": [
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "Pompey's Pillar Alexandria",
    "description": "A massive Roman triumphal column standing 27 metres tall, one of the largest columns ever erected in ancient times. Located in the ancient Serapeum complex with underground galleries and impressive sphinxes.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Alexandria",
      "country": "Egypt",
      "coordinates": {
        "lat": 31.1855,
        "lng": 29.9008
      }
    },
    "image": "https://images.unsplash.com/photo-1603193010847-e26b52955de3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "roman",
      "column",
      "ancient",
      "serapeum",
      "sphinxes"
    ],
    "accessibility": [
      "Restrooms",
      "Guided tours available"
    ]
  },
  {
    "name": "Catacombs of Kom el Shoqafa",
    "description": "The largest known funerary complex in Egypt, built in the 2nd century AD. A fusion of Egyptian, Greek, and Roman styles, the three-level underground tomb contains sculpture and wall paintings of extraordinary quality.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Alexandria",
      "country": "Egypt",
      "coordinates": {
        "lat": 31.1833,
        "lng": 29.9
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "catacombs",
      "roman",
      "underground",
      "ancient",
      "sculpture"
    ],
    "accessibility": [
      "Stairs required",
      "Guided tours available"
    ]
  },
  {
    "name": "Alexandria National Museum",
    "description": "Housed in a beautiful Italian-style villa, the Alexandria National Museum displays 1,800 artifacts from prehistoric to the Islamic era. Well-curated rooms cover Pharaonic, Greco-Roman, Coptic, and Islamic periods.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Alexandria",
      "country": "Egypt",
      "coordinates": {
        "lat": 31.2001,
        "lng": 29.9132
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "museum",
      "greco-roman",
      "history",
      "artifacts",
      "villa"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "White Desert National Park",
    "description": "A national park in the Farafra depression featuring extraordinary chalk-white rock formations sculpted by wind erosion into mushroom and iceberg shapes. Best experienced camping overnight under one of Egypt's clearest skies.",
    "category": "Adventure",
    "budget": "Medium",
    "location": {
      "city": "Farafra",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.2717,
        "lng": 28.0031
      }
    },
    "image": "https://images.unsplash.com/photo-1611111111111-111111111111?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "desert",
      "camping",
      "safari",
      "chalk formations",
      "stars"
    ],
    "accessibility": [
      "4x4 vehicles required"
    ]
  },
  {
    "name": "Siwa Oasis",
    "description": "An isolated oasis near the Libyan border famous for its unique Berber culture, Oracle Temple (where Alexander the Great consulted the oracle), natural salt lakes, hot springs, and lush date palm groves.",
    "category": "Nature",
    "budget": "Medium",
    "location": {
      "city": "Siwa",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.2032,
        "lng": 25.5195
      }
    },
    "image": "https://images.unsplash.com/photo-1571111111111-111111111111?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.9,
    "tags": [
      "oasis",
      "salt lakes",
      "desert",
      "relaxation",
      "berber culture"
    ],
    "accessibility": [
      "Remote location"
    ]
  },
  {
    "name": "Black Desert Egypt",
    "description": "A region in the Western Desert covered with black volcanic rock and ash-covered hills. The dramatic landscape contrasts sharply with the surrounding golden sand dunes, making it a spectacular stop on any Western Desert tour.",
    "category": "Adventure",
    "budget": "Medium",
    "location": {
      "city": "Bahariya",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.35,
        "lng": 28.88
      }
    },
    "image": "https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "desert",
      "volcanic",
      "safari",
      "photography",
      "dramatic"
    ],
    "accessibility": [
      "4x4 vehicles required"
    ]
  },
  {
    "name": "Crystal Mountain Egypt",
    "description": "A small hill in the Western Desert entirely made up of glittering calcite crystals. Located between the Black and White Deserts, the entire mountain sparkles in the sunlight, making it a unique geological wonder.",
    "category": "Nature",
    "budget": "Medium",
    "location": {
      "city": "Farafra",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.3833,
        "lng": 27.85
      }
    },
    "image": "https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "crystals",
      "desert",
      "geology",
      "unique",
      "natural wonder"
    ],
    "accessibility": [
      "4x4 vehicles required"
    ]
  },
  {
    "name": "Bahariya Oasis",
    "description": "A fertile oasis in the Western Desert, a 370km drive from Cairo. Home to lush palm groves, hot sulfur springs, and the remarkable Valley of the Golden Mummies — where 254 mummies were discovered in 1996.",
    "category": "Nature",
    "budget": "Medium",
    "location": {
      "city": "Bahariya",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.3412,
        "lng": 28.8682
      }
    },
    "image": "https://images.unsplash.com/photo-1592609931195-7c7a3d8a2cf9?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "oasis",
      "mummies",
      "hot springs",
      "palm trees",
      "desert"
    ],
    "accessibility": [
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "Dakhla Oasis",
    "description": "One of the most beautiful oases in Egypt's Western Desert, Dakhla features a charming medieval Islamic town with mudbrick houses, pink cliffs, natural hot springs, and ancient Roman ruins at Deir el-Hagar.",
    "category": "Nature",
    "budget": "Low",
    "location": {
      "city": "Dakhla",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.4893,
        "lng": 28.9777
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "oasis",
      "hot springs",
      "medieval",
      "roman ruins",
      "mudbrick"
    ],
    "accessibility": [
      "Guided tours available",
      "Parking available"
    ]
  },
  {
    "name": "Nile River Cruise Luxor to Aswan",
    "description": "The classic way to experience Upper Egypt. Sail on a traditional dahabiya or cruise ship between Luxor and Aswan, stopping at riverside temples including Edfu and Kom Ombo. Typically 3-7 days of unforgettable scenery.",
    "category": "City",
    "budget": "High",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.6872,
        "lng": 32.6396
      }
    },
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "cruise",
      "nile",
      "temples",
      "luxury",
      "scenic"
    ],
    "accessibility": [
      "Restrooms",
      "Restaurants onboard",
      "Guided tours available"
    ]
  },
  {
    "name": "Dendera Temple of Hathor",
    "description": "One of the best-preserved temple complexes in Egypt, featuring a stunning painted astronomical ceiling, the famous Dendera Zodiac, and a unique underground crypt. Less crowded than Luxor's temples.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Qena",
      "country": "Egypt",
      "coordinates": {
        "lat": 26.1415,
        "lng": 32.6699
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "hathor",
      "zodiac",
      "astronomical ceiling",
      "crypt",
      "painted"
    ],
    "accessibility": [
      "Parking available",
      "Restrooms",
      "Guided tours available"
    ]
  },
  {
    "name": "Abydos Temple of Seti I",
    "description": "One of Egypt's most sacred and hauntingly beautiful temples, built by Seti I and completed by Ramesses II. Contains the famous King List inscribed on the walls, extraordinary reliefs, and the Osireion cenotaph below ground.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Sohag",
      "country": "Egypt",
      "coordinates": {
        "lat": 26.1848,
        "lng": 31.9191
      }
    },
    "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "seti I",
      "king list",
      "osiris",
      "sacred",
      "ancient"
    ],
    "accessibility": [
      "Parking available",
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "Aswan Botanical Garden",
    "description": "Located on Kitchener Island in the middle of the Nile, the Aswan Botanical Garden was established in 1898 and features an extraordinary collection of trees and plants from Africa, Asia, and the tropics.",
    "category": "Nature",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.095,
        "lng": 32.888
      }
    },
    "image": "https://images.unsplash.com/photo-1592609931195-7c7a3d8a2cf9?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "garden",
      "island",
      "plants",
      "nile",
      "peaceful"
    ],
    "accessibility": [
      "Boat access required",
      "Wheelchair accessible paths"
    ]
  },
  {
    "name": "Marsa Alam Coral Reef",
    "description": "A pristine diving destination on the southern Red Sea coast, Marsa Alam is famous for dugong sightings, spinner dolphins, and some of the healthiest and least-crowded coral reefs in Egypt.",
    "category": "Nature",
    "budget": "Medium",
    "location": {
      "city": "Marsa Alam",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.0693,
        "lng": 34.8888
      }
    },
    "image": "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "diving",
      "dugong",
      "dolphins",
      "coral",
      "pristine"
    ],
    "accessibility": [
      "Boat access",
      "Diving equipment rental"
    ]
  },
  {
    "name": "Wadi el-Gemal National Park",
    "description": "A protected area on the southern Red Sea coast encompassing desert, mangroves, coral reefs, and the Hamata Archipelago. One of Egypt's least visited and most beautiful parks with extraordinary biodiversity.",
    "category": "Nature",
    "budget": "Medium",
    "location": {
      "city": "Marsa Alam",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.57,
        "lng": 35.17
      }
    },
    "image": "https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "mangroves",
      "desert",
      "coral",
      "national park",
      "biodiversity"
    ],
    "accessibility": [
      "4x4 vehicles required",
      "Guide recommended"
    ]
  },
  {
    "name": "Soma Bay Beach Resort",
    "description": "An exclusive peninsula resort area south of Hurghada featuring luxury hotels, a championship golf course, a world-class kite-surfing lagoon, and spectacular house reefs ideal for diving and snorkeling.",
    "category": "Beach",
    "budget": "High",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.05,
        "lng": 33.9
      }
    },
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "luxury",
      "golf",
      "beach",
      "resort",
      "kitesurfing"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Safaga Red Sea Windsurfing",
    "description": "A small port town south of Hurghada that is internationally renowned for its world-class windsurfing conditions. The consistent strong winds and choppy blue water attract professional windsurfers from around the world.",
    "category": "Adventure",
    "budget": "Medium",
    "location": {
      "city": "Safaga",
      "country": "Egypt",
      "coordinates": {
        "lat": 26.7452,
        "lng": 33.9363
      }
    },
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "windsurfing",
      "red sea",
      "water sports",
      "wind",
      "professional"
    ],
    "accessibility": [
      "Equipment rental available",
      "Restrooms"
    ]
  },
  {
    "name": "Wadi El-Rayan Protected Area",
    "description": "A stunning protected area in the Fayoum region featuring two beautiful connected lakes, a dramatic waterfall (the only natural one in Egypt), desert sand dunes, and extraordinary fossil whale valley (Wadi el-Hitan).",
    "category": "Nature",
    "budget": "Low",
    "location": {
      "city": "Fayoum",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.35,
        "lng": 30.39
      }
    },
    "image": "https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "waterfall",
      "lakes",
      "dunes",
      "fossils",
      "unique"
    ],
    "accessibility": [
      "4x4 vehicles recommended",
      "Parking available"
    ]
  },
  {
    "name": "Wadi el-Hitan Whale Valley",
    "description": "A UNESCO World Heritage Site in the Fayoum desert containing remarkable fossil remains of ancient whales (Archaeoceti) up to 37 metres long. This valley proves that whales evolved from land mammals and once swam this ancient sea.",
    "category": "Nature",
    "budget": "Low",
    "location": {
      "city": "Fayoum",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.2667,
        "lng": 30.0333
      }
    },
    "image": "https://images.unsplash.com/photo-1603193010847-e26b52955de3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "fossils",
      "whales",
      "UNESCO",
      "prehistoric",
      "desert"
    ],
    "accessibility": [
      "4x4 vehicles required",
      "Visitor centre"
    ]
  },
  {
    "name": "Lake Qarun Fayoum",
    "description": "A beautiful natural saltwater lake in the Fayoum Oasis, one of Egypt's largest. The surrounding area has been inhabited since prehistoric times and features pharaonic remains, bird watching sites, and peaceful desert scenery.",
    "category": "Nature",
    "budget": "Low",
    "location": {
      "city": "Fayoum",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.4867,
        "lng": 30.54
      }
    },
    "image": "https://images.unsplash.com/photo-1592609931195-7c7a3d8a2cf9?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "lake",
      "birdwatching",
      "prehistoric",
      "fishing",
      "peaceful"
    ],
    "accessibility": [
      "Parking available",
      "Restrooms nearby"
    ]
  },
  {
    "name": "Bent Pyramid Dahshur",
    "description": "A unique ancient Egyptian pyramid built during the reign of Sneferu around 2600 BC. Its unusual bent profile resulted from a change in angle during construction. Along with the Red Pyramid nearby, it marks Egypt's transition to true pyramids.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.7887,
        "lng": 31.2083
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "pyramid",
      "sneferu",
      "bent",
      "unique",
      "ancient"
    ],
    "accessibility": [
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Red Pyramid Dahshur",
    "description": "The Red Pyramid at Dahshur is the first true smooth-sided pyramid ever built and the third largest pyramid in Egypt. Visitors can descend into the interior chambers through a narrow tunnel, an experience more intimate than Giza.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.8083,
        "lng": 31.2064
      }
    },
    "image": "https://images.unsplash.com/photo-1603193010847-e26b52955de3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "pyramid",
      "red",
      "interior",
      "sneferu",
      "ancient"
    ],
    "accessibility": [
      "Narrow tunnel",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Meidum Pyramid",
    "description": "One of the earliest Egyptian pyramids, possibly built for pharaoh Huni. Its collapsed outer casing gives it a dramatic tower-like appearance rising from a pile of its own ruins — a hauntingly beautiful sight in the desert.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Beni Suef",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.3833,
        "lng": 31.1567
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "pyramid",
      "collapsed",
      "ancient",
      "earliest",
      "dramatic"
    ],
    "accessibility": [
      "Parking available",
      "Guided tours available"
    ]
  },
  {
    "name": "Luxor Sound and Light Show",
    "description": "An evening spectacle at Karnak Temple where the history of ancient Egypt is narrated as the monuments are dramatically illuminated in changing colored lights. A magical and educational experience within the vast temple complex.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.7188,
        "lng": 32.6573
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "sound and light",
      "karnak",
      "evening",
      "illuminated",
      "show"
    ],
    "accessibility": [
      "Seating available",
      "Guided tours available"
    ]
  },
  {
    "name": "Serapeum of Saqqara",
    "description": "An underground catacomb at Saqqara housing the mummified remains of the sacred Apis bulls. The massive polished granite sarcophagi, each weighing 70 tonnes, are among the most awe-inspiring objects in ancient Egypt.",
    "category": "Historic",
    "budget": "Medium",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.878,
        "lng": 31.2167
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "serapeum",
      "apis bulls",
      "underground",
      "granite",
      "saqqara"
    ],
    "accessibility": [
      "Guided tours available",
      "Narrow passages"
    ]
  },
  {
    "name": "Sharm el-Naga Reef Hurghada",
    "description": "One of the most beautiful shore-dive and snorkeling reefs in Egypt, accessible directly from the beach. The shallow lagoon entry leads to an incredible coral garden teeming with fish, turtles, and occasional reef sharks.",
    "category": "Nature",
    "budget": "Low",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.0783,
        "lng": 33.895
      }
    },
    "image": "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "snorkeling",
      "reef",
      "turtles",
      "shore dive",
      "coral"
    ],
    "accessibility": [
      "Beach entry",
      "Restrooms",
      "Equipment rental"
    ]
  },
  {
    "name": "Luxor Souq Market",
    "description": "The traditional market street of Luxor is alive with spice sellers, galabiya shops, alabaster workshops, and papyrus stalls. Bargaining is expected and the atmosphere is buzzing day and night near the temple.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.6961,
        "lng": 32.643
      }
    },
    "image": "https://images.unsplash.com/photo-1553914710-6a71b75b2bc1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "souq",
      "market",
      "spices",
      "shopping",
      "local"
    ],
    "accessibility": [
      "Crowded",
      "Uneven pavement"
    ]
  },
  {
    "name": "Esna Temple of Khnum",
    "description": "A Ptolemaic-Roman temple dedicated to Khnum the ram-headed god, remarkable for its beautifully painted astronomical ceiling inscribed with zodiac symbols. The temple sits in a pit 9 metres below modern street level.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Esna",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.2929,
        "lng": 32.556
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "khnum",
      "roman",
      "ceiling",
      "zodiac",
      "unique"
    ],
    "accessibility": [
      "Stairs required",
      "Guided tours available"
    ]
  },
  {
    "name": "Amada Temple Lake Nasser",
    "description": "The oldest surviving temple in Nubia on Lake Nasser, Amada was built by Thutmose III and contains some of the finest and best-preserved wall paintings of any Egyptian temple. Accessible by Lake Nasser cruise only.",
    "category": "Historic",
    "budget": "High",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 22.7167,
        "lng": 32.25
      }
    },
    "image": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "nubian",
      "lake nasser",
      "thutmose",
      "paintings",
      "cruise only"
    ],
    "accessibility": [
      "Boat access required"
    ]
  },
  {
    "name": "Cairo Tower",
    "description": "A 187-metre concrete tower on Gezira Island with a revolving restaurant at the top offering a 360-degree panoramic view of Cairo, the Nile, and on clear days, the Pyramids. The best aerial overview of the city.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0444,
        "lng": 31.2244
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.2,
    "tags": [
      "tower",
      "panorama",
      "cairo",
      "nile",
      "views"
    ],
    "accessibility": [
      "Elevator",
      "Wheelchair accessible",
      "Restrooms"
    ]
  },
  {
    "name": "Cairo Opera House",
    "description": "The main performing arts venue in Egypt, opened in 1988 on Gezira Island. The complex includes multiple theatres hosting opera, ballet, classical music, and Arabic performances throughout the season.",
    "category": "City",
    "budget": "Medium",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0436,
        "lng": 31.2265
      }
    },
    "image": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "opera",
      "culture",
      "music",
      "ballet",
      "performing arts"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Elevators",
      "Parking available"
    ]
  },
  {
    "name": "Islamic Cairo Historic District",
    "description": "The medieval heart of Cairo, a UNESCO World Heritage Site, is a labyrinth of mosques, madrasas, mausoleums, and Mamluk architecture. Al-Muizz Street, once the main thoroughfare, contains the world's largest concentration of medieval Islamic architecture.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.052,
        "lng": 31.2619
      }
    },
    "image": "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "islamic",
      "medieval",
      "mamluk",
      "architecture",
      "UNESCO"
    ],
    "accessibility": [
      "Uneven surfaces",
      "Guided tours available"
    ]
  },
  {
    "name": "Egyptian Solar Boat Museum",
    "description": "Located at the foot of the Great Pyramid, this museum houses the reconstructed Khufu Solar Boat — a 43-metre ancient vessel buried at the base of the pyramid around 2500 BC. One of the oldest and best-preserved wooden vessels in the world.",
    "category": "Historic",
    "budget": "Medium",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.9755,
        "lng": 31.138
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "solar boat",
      "khufu",
      "ancient",
      "wooden",
      "museum"
    ],
    "accessibility": [
      "Parking available",
      "Guided tours available"
    ]
  },
  {
    "name": "Sound and Light Show Giza",
    "description": "Every evening, the Pyramids and Sphinx are dramatically illuminated as the history of ancient Egypt unfolds in a narrated light show. One of the world's most spectacular and atmospheric outdoor spectacles.",
    "category": "City",
    "budget": "Medium",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.9753,
        "lng": 31.1376
      }
    },
    "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "sound and light",
      "pyramids",
      "evening",
      "illuminated",
      "spectacular"
    ],
    "accessibility": [
      "Seating available",
      "Parking available"
    ]
  },
  {
    "name": "Sharm el-Sheikh Old Market",
    "description": "The original old town of Sharm El-Sheikh, full of spice shops, jewellery stores, clothing stalls, and local restaurants. A lively evening atmosphere that offers a more authentic Egyptian experience than the resort strip.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Sharm El-Sheikh",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.8577,
        "lng": 34.3065
      }
    },
    "image": "https://images.unsplash.com/photo-1553914710-6a71b75b2bc1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.2,
    "tags": [
      "market",
      "shopping",
      "spices",
      "old town",
      "local"
    ],
    "accessibility": [
      "Crowded evenings",
      "Restrooms nearby"
    ]
  },
  {
    "name": "Aswan Unfinished Obelisk",
    "description": "An ancient abandoned obelisk still lying in its granite quarry in Aswan. If completed, it would have been the largest obelisk ever erected. A crack in the granite caused it to be abandoned, revealing exactly how the ancient Egyptians carved obelisks.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Aswan",
      "country": "Egypt",
      "coordinates": {
        "lat": 24.0869,
        "lng": 32.8981
      }
    },
    "image": "https://images.unsplash.com/photo-1603193010847-e26b52955de3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "obelisk",
      "quarry",
      "unfinished",
      "granite",
      "ancient"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "Bedouin Desert Safari Sinai",
    "description": "An overnight desert safari with local Bedouin guides in the mountains and valleys of South Sinai. Sleep in a traditional camp, share a meal by the fire, and experience the extraordinary silence and stars of the desert night.",
    "category": "Adventure",
    "budget": "Medium",
    "location": {
      "city": "Dahab",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.5,
        "lng": 34.3
      }
    },
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.7,
    "tags": [
      "bedouin",
      "safari",
      "desert",
      "camping",
      "stars"
    ],
    "accessibility": [
      "Physical fitness recommended",
      "Guide required"
    ]
  },
  {
    "name": "Cairo Nile Dinner Cruise",
    "description": "A dinner cruise along the Nile in Cairo combining Egyptian cuisine, traditional music, belly dancing, and Tanoura (whirling dervish) performances against the sparkling lights of the city reflected in the river.",
    "category": "City",
    "budget": "Medium",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0561,
        "lng": 31.2394
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "dinner cruise",
      "nile",
      "music",
      "belly dance",
      "entertainment"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Restrooms"
    ]
  },
  {
    "name": "Hurghada Grand Aquarium",
    "description": "One of Egypt's largest aquariums, home to hundreds of Red Sea species in beautifully designed tanks. An underwater tunnel lets visitors walk through a shark tank, making it a favorite for families with children.",
    "category": "City",
    "budget": "Medium",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.1833,
        "lng": 33.8333
      }
    },
    "image": "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "aquarium",
      "sharks",
      "family",
      "red sea",
      "fish"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Restrooms",
      "Parking available"
    ]
  },
  {
    "name": "Ain Sokhna Beach",
    "description": "A popular beach resort area on the Gulf of Suez, just 120km from Cairo. Ain Sokhna is Cairo residents' favourite weekend escape, offering sandy beaches, clear warm water, and natural hot springs flowing into the sea.",
    "category": "Beach",
    "budget": "Medium",
    "location": {
      "city": "Suez",
      "country": "Egypt",
      "coordinates": {
        "lat": 29.5893,
        "lng": 32.3488
      }
    },
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "beach",
      "weekend",
      "hot springs",
      "cairo escape",
      "family"
    ],
    "accessibility": [
      "Wheelchair accessible beach",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Mahmya Island Hurghada",
    "description": "A protected island south of Hurghada with a stunning white sand beach and clear shallow water surrounding pristine house reef. A perfect day trip for snorkelers and families looking for a quiet beach experience.",
    "category": "Beach",
    "budget": "Medium",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.17,
        "lng": 33.95
      }
    },
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "island",
      "white sand",
      "snorkeling",
      "day trip",
      "family"
    ],
    "accessibility": [
      "Boat access required",
      "Life jackets provided"
    ]
  },
  {
    "name": "Mosque of Ibn Tulun Cairo",
    "description": "The oldest mosque in Cairo still standing in its original form, built in 876 AD. Its vast courtyard, unique spiral minaret (inspired by the great mosque of Samarra), and beautiful simplicity make it one of the finest in Egypt.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0278,
        "lng": 31.2486
      }
    },
    "image": "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "mosque",
      "islamic",
      "abbasid",
      "spiral minaret",
      "ancient"
    ],
    "accessibility": [
      "Flat terrain",
      "Restrooms"
    ]
  },
  {
    "name": "Egyptian Grand Museum",
    "description": "The Grand Egyptian Museum (GEM) near the Pyramids is the largest archaeological museum in the world, home to over 100,000 artifacts. The complete treasures of Tutankhamun are displayed here in their entirety for the first time.",
    "category": "Historic",
    "budget": "High",
    "location": {
      "city": "Giza",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.0131,
        "lng": 31.114
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.8,
    "tags": [
      "grand museum",
      "tutankhamun",
      "artifacts",
      "world's largest",
      "modern"
    ],
    "accessibility": [
      "Fully wheelchair accessible",
      "Elevators",
      "Restrooms",
      "Parking"
    ]
  },
  {
    "name": "Nefertari Tomb Valley of Queens",
    "description": "The tomb of Queen Nefertari, wife of Ramesses II, is considered the finest tomb in Egypt. Every surface is covered in brilliantly preserved painted reliefs of the highest artistic quality. Entry is limited to protect the paintings.",
    "category": "Historic",
    "budget": "High",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.725,
        "lng": 32.5938
      }
    },
    "image": "https://images.unsplash.com/photo-1600520611035-84157ad4084d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.9,
    "tags": [
      "nefertari",
      "tomb",
      "paintings",
      "queens",
      "finest"
    ],
    "accessibility": [
      "Limited entry tickets",
      "Guided tours available"
    ]
  },
  {
    "name": "El-Mustafa Mosque Sharm",
    "description": "A beautiful mosque in the heart of Sharm El-Sheikh built in traditional Islamic style with white minarets. It welcomes visitors and provides a peaceful contrast to the resort atmosphere. The evening call to prayer is atmospheric.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Sharm El-Sheikh",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.9125,
        "lng": 34.3292
      }
    },
    "image": "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.4,
    "tags": [
      "mosque",
      "islamic",
      "architecture",
      "peaceful",
      "cultural"
    ],
    "accessibility": [
      "Flat terrain",
      "Restrooms"
    ]
  },
  {
    "name": "Port Said Museum",
    "description": "Located in the historic city at the mouth of the Suez Canal, Port Said Museum houses artifacts relating to the city's unique history including the famous lighthouse and objects from the Suez Canal construction era.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Port Said",
      "country": "Egypt",
      "coordinates": {
        "lat": 31.2565,
        "lng": 32.2841
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.1,
    "tags": [
      "museum",
      "suez canal",
      "history",
      "port",
      "lighthouse"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Guided tours available"
    ]
  },
  {
    "name": "Suez Canal Ismailia",
    "description": "The city of Ismailia on the banks of the Suez Canal was built by Ferdinand de Lesseps during the canal's construction. Its colonial-era architecture, Timsah Lake, and relaxed atmosphere make it a pleasant day trip from Cairo.",
    "category": "City",
    "budget": "Low",
    "location": {
      "city": "Ismailia",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.5965,
        "lng": 32.2715
      }
    },
    "image": "https://images.unsplash.com/photo-1568463415493-79fe2d02b3b1?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.2,
    "tags": [
      "suez canal",
      "colonial",
      "lake",
      "relaxed",
      "history"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Parking available",
      "Restaurants nearby"
    ]
  },
  {
    "name": "Wadi Natrun Monasteries",
    "description": "Four ancient Coptic monasteries in the Natron Valley desert northwest of Cairo, inhabited by monks since the 4th century AD. The monasteries of Anba Bishoy, Baramos, Abu Makar, and Suryan are still functioning monastic communities.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Cairo",
      "country": "Egypt",
      "coordinates": {
        "lat": 30.35,
        "lng": 30.3333
      }
    },
    "image": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "monastery",
      "coptic",
      "christian",
      "desert",
      "ancient"
    ],
    "accessibility": [
      "Parking available",
      "Guided tours available",
      "Restrooms"
    ]
  },
  {
    "name": "Marsa Matruh Beach",
    "description": "A stunning Mediterranean coastal city in northwest Egypt with some of the most beautiful turquoise beaches in Egypt. Cleopatra Beach and Rommel Beach are famous for their crystal-clear shallow water and white sand.",
    "category": "Beach",
    "budget": "Low",
    "location": {
      "city": "Marsa Matruh",
      "country": "Egypt",
      "coordinates": {
        "lat": 31.3525,
        "lng": 27.2366
      }
    },
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "beach",
      "mediterranean",
      "turquoise",
      "white sand",
      "cleopatra"
    ],
    "accessibility": [
      "Wheelchair accessible beach",
      "Parking available",
      "Restrooms"
    ]
  },
  {
    "name": "Wadi El-Hol Rock Inscriptions",
    "description": "A remote desert valley in Upper Egypt containing some of the oldest alphabetic inscriptions in the world, dating to around 1900 BC. These Proto-Sinaitic inscriptions may represent the birth of the alphabet itself.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Luxor",
      "country": "Egypt",
      "coordinates": {
        "lat": 25.5217,
        "lng": 32.255
      }
    },
    "image": "https://images.unsplash.com/photo-1603193010847-e26b52955de3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.3,
    "tags": [
      "inscriptions",
      "alphabet",
      "ancient",
      "remote",
      "archaeology"
    ],
    "accessibility": [
      "4x4 vehicles required",
      "Guide required"
    ]
  },
  {
    "name": "Sharm Observatory Astronomy",
    "description": "Located in the mountains above Sharm El-Sheikh, this observatory offers spectacular stargazing experiences in the clear desert skies of Sinai. Night sky tours led by astronomers are a memorable addition to any beach holiday.",
    "category": "Adventure",
    "budget": "Medium",
    "location": {
      "city": "Sharm El-Sheikh",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.04,
        "lng": 34.31
      }
    },
    "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "stars",
      "astronomy",
      "observatory",
      "night sky",
      "sinai"
    ],
    "accessibility": [
      "Transport provided",
      "Not suitable for wheelchair users"
    ]
  },
  {
    "name": "Hurghada Museum",
    "description": "The first interactive museum in the Red Sea Governorate, opened in 2021. It houses over 500 artifacts spanning Egypt's entire history from Pharaonic to Islamic eras, presented using modern display technology in a beautiful setting.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Hurghada",
      "country": "Egypt",
      "coordinates": {
        "lat": 27.25,
        "lng": 33.8122
      }
    },
    "image": "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.5,
    "tags": [
      "museum",
      "interactive",
      "artifacts",
      "modern",
      "history"
    ],
    "accessibility": [
      "Wheelchair accessible",
      "Elevators",
      "Restrooms",
      "Parking"
    ]
  },
  {
    "name": "Monastery of St. Anthony Red Sea",
    "description": "The oldest inhabited Christian monastery in the world, established in 356 AD in the Eastern Desert mountains near the Red Sea. Built over the cave where St. Anthony the Great lived as a hermit for 25 years.",
    "category": "Historic",
    "budget": "Low",
    "location": {
      "city": "Suez",
      "country": "Egypt",
      "coordinates": {
        "lat": 28.9333,
        "lng": 32.35
      }
    },
    "image": "https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?q=80&w=1000&auto=format&fit=crop",
    "average_rating": 4.6,
    "tags": [
      "monastery",
      "coptic",
      "oldest",
      "saint anthony",
      "desert"
    ],
    "accessibility": [
      "Parking available",
      "Guided tours available",
      "Restrooms"
    ]
  }
];

async function seedDatabase() {
  console.log("Starting to seed Egypt places to Firestore...");
  let count = 0;
  
  for (const place of egyptPlaces) {
    try {
      const docId = place.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      await setDoc(doc(collection(db, "places"), docId), place);
      console.log(`✅ Added: ${place.name}`);
      count++;
    } catch (error) {
      console.error(`❌ Failed to add ${place.name}:`, error);
    }
  }
  
  console.log(`\n🎉 Successfully seeded ${count} places!`);
  process.exit(0);
}

seedDatabase();
