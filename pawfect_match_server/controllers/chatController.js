const { client } = require('../config/db');

// Get all threads for a user (distinct users they've chatted with)
exports.getThreads = async (req, res) => {
  const userEmail = req.query.email;
  try {
    const db = client.db('pawfect_match');
    const threads = await db.collection('messages').aggregate([
      { $match: { $or: [ { fromEmail: userEmail }, { toEmail: userEmail } ] } },
      { $project: {
          user: {
            $cond: [
              { $eq: [ "$fromEmail", userEmail ] }, "$toEmail", "$fromEmail"
            ]
          },
          content: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$user",
          lastMessage: { $first: "$content" },
          lastDate: { $first: "$createdAt" }
        }
      },
      { $sort: { lastDate: -1 } }
    ]).toArray();

    // Get user information for each thread
    const threadsWithUserInfo = await Promise.all(
      threads.map(async (thread) => {
        const user = await db.collection('users').findOne({ email: thread._id });
        return {
          ...thread,
          userName: user?.name || 'Unknown User',
          userPhotoURL: user?.photoURL || null,
          firstName: user?.name ? user.name.split(' ')[0] : 'Unknown'
        };
      })
    );

    res.json(threadsWithUserInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all messages between two users
exports.getMessages = async (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2) {
    return res.status(400).json({ error: "Missing user1 or user2 in query params" });
  }
  try {
    const db = client.db('pawfect_match');
    const messages = await db.collection('messages')
      .find({
        $or: [
          { fromEmail: user1, toEmail: user2 },
          { fromEmail: user2, toEmail: user1 }
        ]
      })
      .sort({ createdAt: 1 })
      .toArray();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  const { fromEmail, toEmail } = req.body;
  try {
    const db = client.db('pawfect_match');
    await db.collection('messages').updateMany(
      { fromEmail, toEmail, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  const { fromEmail, toEmail, content } = req.body;
  try {
    const db = client.db('pawfect_match');
    const message = {
      fromEmail,
      toEmail,
      content,
      createdAt: new Date(),
      read: false
    };
    const result = await db.collection('messages').insertOne(message);
    const savedMessage = { ...message, _id: result.insertedId };
    
    console.log('Message saved to database:', savedMessage);
    
    // Emit socket event to both sender and receiver
    const io = req.app.get('io');
    if (io) {
      console.log('Emitting socket events to:', fromEmail, 'and', toEmail);
      io.to(fromEmail).emit('receive_message', savedMessage);
      io.to(toEmail).emit('receive_message', savedMessage);
    } else {
      console.log('Socket.io not available');
    }
    
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: err.message });
  }
}; 