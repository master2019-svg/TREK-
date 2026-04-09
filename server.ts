import express from 'express';
import { createServer as createViteServer } from 'vite';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import { getDistance } from 'geolib';

const app = express();
const PORT = 3000;

// MongoDB Connection
const MONGO_URI = "mongodb+srv://shehabwww153:cmCqBjtQCQDWbvlo@userauth.rvtb5.mongodb.net/travel_app?retryWrites=true&w=majority&appName=userAuth";
const client = new MongoClient(MONGO_URI);
let db: any;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("travel_app");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

async function startServer() {
  await connectDB();

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: db ? 'connected' : 'disconnected' });
  });

  // Recommendations API
  app.get('/api/recommendations/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
      const placesCollection = db.collection("places");
      
      // Basic recommendation: just return top rated places for now
      // In a real app, we'd filter by user preferences
      const places = await placesCollection.find({}).sort({ average_rating: -1 }).limit(10).toArray();
      
      const formattedData = places.map((p: any) => ({
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
      const { query } = req.query;
      const placesCollection = db.collection("places");
      
      if (!query) return res.json({ data: [] });

      // Basic text search
      const places = await placesCollection.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query as string, 'i')] } }
        ]
      }).limit(10).toArray();

      const formattedData = places.map((p: any) => ({
        place: {
          ...p,
          place_id: p._id.toString()
        }
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
      const { user_id } = req.params;
      const placesCollection = db.collection("places");
      
      // For roadmap, we'll just pick 5 interesting places
      const places = await placesCollection.find({}).limit(5).toArray();
      
      const data = places.map((p: any, idx: number) => ({
        place: {
          ...p,
          place_id: p._id.toString()
        },
        next_destination: idx < places.length - 1 ? places[idx + 1].name : null
      }));

      res.json({ data });
    } catch (error) {
      console.error("Roadmap error:", error);
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
