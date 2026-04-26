const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `  // Follow User
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
  });`;

content = content.replace(/ \/\/ Follow User[\s\S]*?res\.status\(500\)\.json\(\{ error: "Failed to follow user" \}\);\s*\}\s*\}\);/, replacement);

fs.writeFileSync('server.ts', content);
