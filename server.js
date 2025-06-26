// server.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// In-memory storage for events
let events = [];

// Routes

// ✅ Root route to confirm backend is working
app.get('/', (req, res) => {
  res.send('🎉 Event Management Backend is live!');
});

// Get all events
app.get('/events', (req, res) => {
  res.json(events);
});

// Create event
app.post('/events', upload.single('image'), (req, res) => {
  const { title, date, description, category, tags } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  const newEvent = {
    id: Date.now(),
    title,
    date,
    description,
    category,
    tags,
    image
  };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// Delete event
app.delete('/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  events = events.filter(event => event.id !== id);
  res.status(204).end();
});

// Update event
app.put('/events/:id', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);
  const index = events.findIndex(event => event.id === id);

  if (index !== -1) {
    const { title, date, description, category, tags } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : events[index].image;

    events[index] = {
      ...events[index],
      title,
      date,
      description,
      category,
      tags,
      image
    };

    res.json(events[index]);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
