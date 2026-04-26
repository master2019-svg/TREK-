import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where, deleteDoc, arrayUnion, documentId } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Firebase Client SDK for Node.js
let db: any;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log("✅ Connected to Firebase Firestore");
  } else {
    console.warn("⚠️ firebase-applet-config.json not found. Firestore will not work.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase:", error);
}

async function startServer() {
  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: db ? 'firebase_connected' : 'disconnected' });
  });

  // Get Preferences
  app.get('/api/preferences/:user_id', async (req, res) => {
    try {
      const docSnap = await getDoc(doc(db, "user_travel_preferences", req.params.user_id));
      res.json({ data: docSnap.exists() ? docSnap.data() : {} });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  // Save Preferences
  app.post('/api/preferences', async (req, res) => {
    try {
      const { user_id, ...prefs } = req.body;
      await setDoc(doc(db, "user_travel_preferences", user_id), {
        ...prefs,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  // Save Interaction
  app.post('/api/interactions', async (req, res) => {
    try {
      const { user_id, place_id, interaction_type } = req.body;
      const interactionId = `${user_id}_${place_id}_${interaction_type.replace('un', '')}`;
      
      if (interaction_type === 'unlike' || interaction_type === 'unsave') {
        await deleteDoc(doc(db, "interactions", interactionId));
      } else {
        await setDoc(doc(db, "interactions", interactionId), {
          user_id,
          place_id,
          interaction_type,
          timestamp: new Date().toISOString()
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save interaction" });
    }
  });

  // Get Interactions
  app.get('/api/interactions/:user_id', async (req, res) => {
    try {
      const q = query(collection(db, "interactions"), where("user_id", "==", req.params.user_id));
      const querySnapshot = await getDocs(q);
      const interactions = querySnapshot.docs.map(doc => doc.data());
      res.json({ data: interactions });
    } catch (error) {
      console.error("Failed to fetch interactions:", error);
      res.status(500).json({ error: "Failed to fetch interactions" });
    }
  });

  // Get Liked Places
  app.get('/api/users/:user_id/liked-places', async (req, res) => {
    try {
      const q = query(collection(db, "interactions"), where("user_id", "==", req.params.user_id), where("interaction_type", "==", "like"));
      const querySnapshot = await getDocs(q);
      const likedPlaceIds = querySnapshot.docs.map(doc => doc.data().place_id);
      
      if (likedPlaceIds.length === 0) {
        return res.json({ data: [] });
      }

      // Fetch places in chunks of 10 (Firestore 'in' query limit)
      const places = [];
      for (let i = 0; i < likedPlaceIds.length; i += 10) {
        const chunk = likedPlaceIds.slice(i, i + 10);
        const placesQuery = query(collection(db, "places"), where(documentId(), "in", chunk));
        const placesSnap = await getDocs(placesQuery);
        places.push(...placesSnap.docs.map(doc => ({ place_id: doc.id, ...doc.data() })));
      }

      res.json({ data: places });
    } catch (error) {
      console.error("Failed to fetch liked places:", error);
      res.status(500).json({ error: "Failed to fetch liked places" });
    }
  });

  // Sync User
  app.post('/api/users/sync', async (req, res) => {
    try {
      const { uid, email, displayName, photoURL } = req.body;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid, email, displayName, photoURL,
          following: [], followers: [],
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        await updateDoc(userRef, {
          email, displayName, photoURL,
          lastLogin: new Date().toISOString()
        });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to sync user:", error);
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

   // Follow User
  app.post('/api/friends/follow', async (req, res) => {
    try {
      const { user_id, friend_id } = req.body;
      await updateDoc(doc(db, "users", user_id), { following: arrayUnion(friend_id) });
      await updateDoc(doc(db, "users", friend_id), { followers: arrayUnion(user_id) });
      
      const userSnap = await getDoc(doc(db, "users", user_id));
      const u = userSnap.data();
      if (u) {
        const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
        await addDoc(collection(db, "notifications"), {
          userId: friend_id,
          type: 'follow',
          message: 'started following you',
          target: '',
          tab: 'friends',
          actorName: (u.displayName || u.nickname) || 'A traveler',
          actorPhoto: u.photoURL || '',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to follow user" });
    }
  });

  // Get User Stats
  app.get('/api/users/:uid/stats', async (req, res) => {
    try {
      const userSnap = await getDoc(doc(db, "users", req.params.uid));
      const user = userSnap.data();
      res.json({ data: { 
        following: user?.following?.length || 0, 
        followers: user?.followers?.length || 0 
      }});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Get User Profile
  app.get('/api/users/:uid', async (req, res) => {
    try {
      const userSnap = await getDoc(doc(db, "users", req.params.uid));
      res.json({ data: userSnap.exists() ? userSnap.data() : null });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update Nickname
  app.post('/api/users/nickname', async (req, res) => {
    try {
      const { uid, nickname } = req.body;
      await updateDoc(doc(db, "users", uid), { nickname });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update nickname" });
    }
  });

  // Search Users (Friends)
  app.get('/api/users/search', async (req, res) => {
    try {
      const { query: searchQuery } = req.query;
      if (!searchQuery) return res.json({ data: [] });

      const queryStr = (searchQuery as string).toLowerCase();
      
      // Fetch all users and their preferences for semantic search
      const usersSnap = await getDocs(collection(db, "users"));
      const prefsSnap = await getDocs(collection(db, "user_travel_preferences"));
      
      const prefsMap = new Map();
      prefsSnap.docs.forEach(doc => prefsMap.set(doc.id, doc.data()));

      const users = usersSnap.docs.map(doc => {
        const u = doc.data();
        const p = prefsMap.get(u.uid) || {};
        return {
          uid: u.uid,
          displayName: u.displayName || '',
          nickname: u.nickname || '',
          email: u.email || '',
          photoURL: u.photoURL,
          bio: p.tags?.join(' ') + ' ' + p.categories?.join(' ') + ' ' + (p.destinations?.join(' ') || '')
        };
      });

      // Simple matching first
      let matchedUsers = users.filter(u => 
        String(u.nickname || '').toLowerCase().includes(queryStr) ||
        String(u.displayName || '').toLowerCase().includes(queryStr) ||
        String(u.email || '').toLowerCase().includes(queryStr)
      );

      // If no direct matches, or if it looks like a natural language query ("find people who like diving")
      if (queryStr.includes(' ') || matchedUsers.length === 0) {
        try {
          const prompt = `
          You are a semantic search engine matching user queries to user profiles.
          Query: "${queryStr}"
          
          Users:
          ${users.map(u => `ID: ${u.uid} | Name: ${u.displayName || u.nickname} | Keywords: ${u.bio}`).join('\n')}
          
          Return a comma-separated list of the top 5 user IDs that best match the query. If none match well, return an empty string. Only return the IDs, nothing else. Never return backticks or markdown, just raw text.
          `;
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          
          const idsString = response.text || '';
          const rankedIds = idsString.split(',').map((id: string) => id.trim()).filter((id: string) => id);
          
          if (rankedIds.length > 0) {
            matchedUsers = rankedIds.map((id: string) => users.find(u => u.uid === id)).filter((u: any) => u);
          }
        } catch (aiError) {
          console.error("Gemini semantic search failed, falling back to basic search", aiError);
        }
      }

      res.json({ data: matchedUsers.slice(0, 10).map((u: any) => ({ 
        uid: u.uid, displayName: u.displayName, nickname: u.nickname, photoURL: u.photoURL, email: u.email
      }))});
    } catch (error) {
      console.error("User search error:", error);
      res.status(500).json({ error: "Failed to search users" });
    }
  });

  // Recommendations API
  app.get('/api/recommendations/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
      
      const prefsSnap = await getDoc(doc(db, "user_travel_preferences", user_id));
      const prefs = prefsSnap.exists() ? prefsSnap.data() : {};
      const userDestinations = prefs.destinations || [];
      const userBudget = prefs.budget || 'medium';
      const userAccessibility = prefs.accessibility_needs || [];
      const userCategories = prefs.categories || [];
      const userTags = prefs.tags || [];
      
      const interactionsSnap = await getDocs(query(collection(db, "interactions"), where("user_id", "==", user_id)));
      const interactions = interactionsSnap.docs.map(doc => doc.data());
      const likedPlaceIds = interactions.filter(i => i.interaction_type === 'like').map(i => i.place_id);
      const savedPlaceIds = interactions.filter(i => i.interaction_type === 'save').map(i => i.place_id);

      const userDocSnap = await getDoc(doc(db, "users", user_id));
      const following = userDocSnap.exists() ? (userDocSnap.data().following || []) : [];
      
      let friendsLikedPlaceIds: string[] = [];
      if (following.length > 0) {
        // Firestore 'in' query is limited to 10, so we fetch all and filter in memory for simplicity in prototype
        const allInteractionsSnap = await getDocs(query(collection(db, "interactions"), where("interaction_type", "==", "like")));
        friendsLikedPlaceIds = allInteractionsSnap.docs
          .map(doc => doc.data())
          .filter(i => following.includes(i.user_id))
          .map(i => i.place_id);
      }

      const placesSnap = await getDocs(collection(db, "places"));
      const places = placesSnap.docs.map(doc => ({ ...doc.data(), _id: doc.id, place_id: doc.id }));
      
      const scoredPlaces = places.map((place: any) => {
        let score = 0;
        const rating = place.average_rating ? parseFloat(place.average_rating.toString()) : 0;
        score += (rating / 5) * 0.15;
        
        if (userCategories.includes(place.category)) score += 0.3;

        if (userTags.length > 0 && place.tags) {
          const matchCount = userTags.filter((tag: string) => place.tags.includes(tag)).length;
          score += (matchCount / userTags.length) * 0.2;
        }

        if (userDestinations.length > 0) {
          const inDest = userDestinations.some((d: string) => 
            place.location?.city?.toLowerCase().includes(d.toLowerCase()) || 
            place.location?.country?.toLowerCase().includes(d.toLowerCase())
          );
          if (inDest) score += 0.4;
        }

        const budgetMap: Record<string, number> = { low: 1, medium: 2, high: 3, luxury: 4 };
        const pBudget = budgetMap[place.budget?.toLowerCase()] || 2;
        const uBudget = budgetMap[userBudget] || 2;
        const budgetDiff = Math.abs(pBudget - uBudget);
        score += (1 - (budgetDiff / 3)) * 0.15;

        if (userAccessibility.length > 0) {
          const matchCount = userAccessibility.filter((need: string) => 
            place.accessibility?.includes(need)
          ).length;
          score += (matchCount / userAccessibility.length) * 0.2;
        }

        if (friendsLikedPlaceIds.includes(place.place_id)) {
          score += 0.35;
          place.recommendedByFriend = true;
        }

        if (likedPlaceIds.includes(place.place_id) || savedPlaceIds.includes(place.place_id)) {
          score -= 0.5; 
        }

        score += Math.random() * 0.1;
        return { ...place, score };
      });

      scoredPlaces.sort((a: any, b: any) => b.score - a.score);
      const topPlaces = scoredPlaces.slice(0, 20);

      res.json({ data: topPlaces.map((p: any) => ({ place: p })) });
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Search API
  app.get('/api/search/:user_id', async (req, res) => {
    try {
      const { query: searchQuery, category, budget } = req.query;
      
      const placesSnap = await getDocs(collection(db, "places"));
      let places = placesSnap.docs.map(doc => ({ ...doc.data(), _id: doc.id, place_id: doc.id }));
      
      if (searchQuery) {
        const qStr = (searchQuery as string).toLowerCase();
        places = places.filter((p: any) => 
          (p.name && p.name.toLowerCase().includes(qStr)) ||
          (p.category && p.category.toLowerCase().includes(qStr)) ||
          (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(qStr))) ||
          (p.location?.city && p.location.city.toLowerCase().includes(qStr)) ||
          (p.location?.country && p.location.country.toLowerCase().includes(qStr))
        );
      }

      if (category && category !== 'all') {
        places = places.filter((p: any) => p.category?.toLowerCase() === (category as string).toLowerCase());
      }

      if (budget && budget !== 'all') {
        places = places.filter((p: any) => p.budget?.toLowerCase() === (budget as string).toLowerCase());
      }

      res.json({ data: places.slice(0, 20).map((p: any) => ({ place: p })) });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search places" });
    }
  });

  // Roadmap API
  app.get('/api/roadmap/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
      
      const prefsSnap = await getDoc(doc(db, "user_travel_preferences", user_id));
      const userDestinations = prefsSnap.exists() ? (prefsSnap.data().destinations || []) : [];

      const placesSnap = await getDocs(collection(db, "places"));
      let places = placesSnap.docs.map(doc => ({ ...doc.data(), _id: doc.id, place_id: doc.id }));

      if (userDestinations.length > 0) {
        const destMatched = places.filter((p: any) => 
          userDestinations.some((d: string) => 
            p.location?.city?.toLowerCase().includes(d.toLowerCase()) || 
            p.location?.country?.toLowerCase().includes(d.toLowerCase())
          )
        );
        if (destMatched.length > 0) places = destMatched;
      }

      places = places.slice(0, 6);
      
      const data = places.map((p: any, idx: number) => ({
        place: p,
        next_destination: idx < places.length - 1 ? (places[idx + 1] as any).name : null
      }));

      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roadmap" });
    }
  });

  // Reviews API
  app.get('/api/reviews/:place_id', async (req, res) => {
    try {
      const { place_id } = req.params;
      const reviewsSnap = await getDocs(query(collection(db, "reviews"), where("place_id", "==", place_id)));
      const reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ data: reviews });
    } catch (error) {
      console.error("Reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
