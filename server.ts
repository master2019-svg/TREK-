import express from 'express';
import { createServer as createViteServer } from 'vite';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { getDistance } from 'geolib';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// MongoDB Connection
const password = process.env.MONGO_PASSWORD || "cmCqBjtQCQDWbvlo";
const encodedPassword = encodeURIComponent(password);
const defaultUri = `mongodb+srv://shehabwww153:${encodedPassword}@userauth.rvtb5.mongodb.net/travel_app?retryWrites=true&w=majority&appName=userAuth`;
const MONGO_URI = process.env.MONGO_URI || defaultUri;
const client = new MongoClient(MONGO_URI);
let db: any;

async function getDb(retries = 3) {
  if (!db) {
    for (let i = 0; i < retries; i++) {
      try {
        await client.connect();
        db = client.db("travel_app");
        console.log("✅ Connected to MongoDB");
        
        // Define collections (for reference, matching Python backend)
        const collections = {
          users: db.collection("users"),
          places: db.collection("places"),
          interactions: db.collection("interactions"),
          search_queries: db.collection("search_queries"),
          travel_preferences: db.collection("user_travel_preferences"),
          recommendations_cache: db.collection("recommendations_cache"),
          shown_places: db.collection("shown_places"),
          roadmaps: db.collection("roadmaps"),
          cache_locks: db.collection("cache_locks"),
          user_keywords_cache: db.collection("user_keywords_cache"),
          keyword_similarity_cache: db.collection("keyword_similarity_cache"),
          similar_users_cache: db.collection("similar_users_cache"),
          translation_cache: db.collection("translation_cache"),
          reviews: db.collection("reviews")
        };

        // Create TTL indexes
        try {
          await collections.translation_cache.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 604800 });
          await collections.user_keywords_cache.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 86400 });
          await collections.keyword_similarity_cache.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 86400 });
          await collections.similar_users_cache.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 43200 });
          await collections.roadmaps.createIndex({ "created_at": 1 }, { expireAfterSeconds: 86400 });
          await collections.recommendations_cache.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 21600 });
          
          try {
            await collections.shown_places.dropIndex('last_updated_1');
          } catch (e) {}
          await collections.shown_places.createIndex({ "last_updated": 1 }, { expireAfterSeconds: 21600 });
          
          await collections.cache_locks.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 600 });

          // Create user_id indexes
          for (const coll of [collections.recommendations_cache, collections.shown_places, collections.roadmaps, collections.cache_locks]) {
            await coll.createIndex({ "user_id": 1 });
          }
          console.log("✅ Created MongoDB indexes");
        } catch (error) {
          console.error("❌ Error creating indexes:", error);
        }
        
        return db;
      } catch (error) {
        console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          throw new Error(`Database connection failed after ${retries} attempts`);
        }
        await new Promise(res => setTimeout(res, 2000)); // wait 2s before retry
      }
    }
  }
  return db;
}

async function startServer() {
  // Try initial connection, but don't block server start if it fails
  try {
    await getDb();
  } catch (e) {
    console.warn("⚠️ Initial DB connection failed, will retry on first request");
  }

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: db ? 'connected' : 'disconnected' });
  });

  // Get Preferences
  app.get('/api/preferences/:user_id', async (req, res) => {
    try {
      const database = await getDb();
      const prefs = await database.collection("user_travel_preferences").findOne({ user_id: req.params.user_id });
      res.json({ data: prefs || {} });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  // Save Preferences
  app.post('/api/preferences', async (req, res) => {
    try {
      const database = await getDb();
      const { user_id, ...prefs } = req.body;
      await database.collection("user_travel_preferences").updateOne(
        { user_id },
        { $set: { ...prefs, updatedAt: new Date() } },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  // Save Interaction
  app.post('/api/interactions', async (req, res) => {
    try {
      const database = await getDb();
      const { user_id, place_id, interaction_type } = req.body;
      
      if (interaction_type === 'unlike' || interaction_type === 'unsave') {
        await database.collection("interactions").deleteOne({
          user_id,
          place_id,
          interaction_type: interaction_type.replace('un', '')
        });
      } else {
        await database.collection("interactions").updateOne(
          { user_id, place_id, interaction_type },
          { $set: { timestamp: new Date() } },
          { upsert: true }
        );
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save interaction" });
    }
  });

  // Get Interactions
  app.get('/api/interactions/:user_id', async (req, res) => {
    try {
      const database = await getDb();
      const interactions = await database.collection("interactions").find({ user_id: req.params.user_id }).toArray();
      res.json({ data: interactions });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interactions" });
    }
  });

  // Sync User
  app.post('/api/users/sync', async (req, res) => {
    try {
      const database = await getDb();
      const { uid, email, displayName, photoURL } = req.body;
      
      await database.collection("users").updateOne(
        { uid },
        { 
          $set: { email, displayName, photoURL, lastLogin: new Date() },
          $setOnInsert: { following: [], createdAt: new Date() }
        },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  // Follow User
  app.post('/api/friends/follow', async (req, res) => {
    try {
      const database = await getDb();
      const { user_id, friend_id } = req.body;
      
      await database.collection("users").updateOne(
        { uid: user_id },
        { $addToSet: { following: friend_id } },
        { upsert: true }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to follow user" });
    }
  });

  // Search Users (Friends)
  app.get('/api/users/search', async (req, res) => {
    try {
      const database = await getDb();
      const { query } = req.query;
      
      if (!query) return res.json({ data: [] });

      const users = await database.collection("users").find({
        $or: [
          { displayName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      }).limit(10).toArray();

      res.json({ data: users.map((u: any) => ({ uid: u.uid, displayName: u.displayName, photoURL: u.photoURL })) });
    } catch (error) {
      res.status(500).json({ error: "Failed to search users" });
    }
  });

  // Recommendations API with Advanced Algorithm (Instagram-like feed + Friends Blend)
  app.get('/api/recommendations/:user_id', async (req, res) => {
    try {
      const database = await getDb();
      const { user_id } = req.params;
      
      // 1. Fetch user preferences
      const prefs = await database.collection("user_travel_preferences").findOne({ user_id }) || {};
      const userDestinations = prefs.destinations || [];
      const userBudget = prefs.budget || 'medium';
      const userAccessibility = prefs.accessibility_needs || [];
      const userCategories = prefs.categories || [];
      const userTags = prefs.tags || [];
      
      // 2. Fetch user interactions
      const interactions = await database.collection("interactions").find({ user_id }).toArray();
      const likedPlaceIds = interactions.filter((i: any) => i.interaction_type === 'like').map((i: any) => i.place_id);
      const savedPlaceIds = interactions.filter((i: any) => i.interaction_type === 'save').map((i: any) => i.place_id);

      // 3. Fetch friends (following)
      const userDoc = await database.collection("users").findOne({ uid: user_id });
      const following = userDoc?.following || [];
      
      // Fetch friends' interactions to blend in
      let friendsLikedPlaceIds: string[] = [];
      if (following.length > 0) {
        const friendsInteractions = await database.collection("interactions").find({ 
          user_id: { $in: following },
          interaction_type: 'like'
        }).toArray();
        friendsLikedPlaceIds = friendsInteractions.map((i: any) => i.place_id);
      }

      // 4. Fetch all places
      const places = await database.collection("places").find({}).toArray();
      
      // 5. Score places (Advanced Algorithm)
      const scoredPlaces = places.map((place: any) => {
        let score = 0;
        
        // Rating factor (0-1) * 0.15
        const rating = place.average_rating ? parseFloat(place.average_rating.toString()) : 0;
        score += (rating / 5) * 0.15;
        
        // Category Match
        if (userCategories.includes(place.category)) {
          score += 0.3;
        }

        // Tags Match
        if (userTags.length > 0 && place.tags) {
          const matchCount = userTags.filter((tag: string) => place.tags.includes(tag)).length;
          score += (matchCount / userTags.length) * 0.2;
        }

        // Destination match (Boost)
        if (userDestinations.length > 0) {
          const inDest = userDestinations.some((d: string) => 
            place.location?.city?.toLowerCase().includes(d.toLowerCase()) || 
            place.location?.country?.toLowerCase().includes(d.toLowerCase())
          );
          if (inDest) score += 0.4;
        }

        // Budget match
        const budgetMap: Record<string, number> = { low: 1, medium: 2, high: 3, luxury: 4 };
        const pBudget = budgetMap[place.budget?.toLowerCase()] || 2;
        const uBudget = budgetMap[userBudget] || 2;
        const budgetDiff = Math.abs(pBudget - uBudget);
        score += (1 - (budgetDiff / 3)) * 0.15;

        // Accessibility match
        if (userAccessibility.length > 0) {
          const matchCount = userAccessibility.filter((need: string) => 
            place.accessibility?.includes(need)
          ).length;
          score += (matchCount / userAccessibility.length) * 0.2;
        }

        // Blend Mode: Boost places liked by friends (Social Proof)
        if (friendsLikedPlaceIds.includes(place._id.toString())) {
          score += 0.35; // Significant boost for friends' recommendations
          place.recommendedByFriend = true;
        }

        // Interaction history (penalize already interacted places slightly to show new ones)
        if (likedPlaceIds.includes(place._id.toString()) || savedPlaceIds.includes(place._id.toString())) {
          score -= 0.5; 
        }

        // Add some randomness for discovery (Instagram-like exploration)
        score += Math.random() * 0.1;

        return { ...place, score };
      });

      // 6. Sort and return top 20 for an infinite-scroll like feed
      scoredPlaces.sort((a: any, b: any) => b.score - a.score);
      const topPlaces = scoredPlaces.slice(0, 20);

      const formattedData = topPlaces.map((p: any) => ({
        place: {
          ...p,
          place_id: p._id.toString()
        }
      }));

      res.json({ data: formattedData });
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Search API
  app.get('/api/search/:user_id', async (req, res) => {
    try {
      const database = await getDb();
      const { query, category, budget } = req.query;
      
      let dbQuery: any = {};
      
      if (query) {
        dbQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query as string, 'i')] } },
          { "location.city": { $regex: query, $options: 'i' } },
          { "location.country": { $regex: query, $options: 'i' } }
        ];
      }

      if (category && category !== 'all') {
        dbQuery.category = { $regex: category, $options: 'i' };
      }

      if (budget && budget !== 'all') {
        dbQuery.budget = { $regex: budget, $options: 'i' };
      }

      // If no filters are applied, return empty or a default set
      if (Object.keys(dbQuery).length === 0) {
        const places = await database.collection("places").find({}).limit(20).toArray();
        const formattedData = places.map((p: any) => ({
          place: { ...p, place_id: p._id.toString() }
        }));
        return res.json({ data: formattedData });
      }

      const places = await database.collection("places").find(dbQuery).limit(20).toArray();

      const formattedData = places.map((p: any) => ({
        place: { ...p, place_id: p._id.toString() }
      }));

      res.json({ data: formattedData });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search places" });
    }
  });

  // Roadmap API
  app.get('/api/roadmap/:user_id', async (req, res) => {
    try {
      const database = await getDb();
      const { user_id } = req.params;
      
      // Fetch user preferences
      const prefs = await database.collection("user_travel_preferences").findOne({ user_id }) || {};
      const userDestinations = prefs.destinations || [];

      let query: any = {};
      if (userDestinations.length > 0) {
        query = {
          $or: userDestinations.map((d: string) => ({
            $or: [
              { "location.city": { $regex: d, $options: 'i' } },
              { "location.country": { $regex: d, $options: 'i' } }
            ]
          }))
        };
      }

      // Get places matching destination, limit to 6 for a roadmap
      let places = await database.collection("places").find(query).limit(6).toArray();
      
      // Fallback if no places match
      if (places.length === 0) {
        places = await database.collection("places").find({}).limit(6).toArray();
      }

      // Sort places by distance to create a logical route (simplified)
      // In a real app, use TSP (Traveling Salesperson Problem) algorithm
      
      const data = places.map((p: any, idx: number) => ({
        place: { ...p, place_id: p._id.toString() },
        next_destination: idx < places.length - 1 ? places[idx + 1].name : null
      }));

      res.json({ data });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roadmap" });
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
