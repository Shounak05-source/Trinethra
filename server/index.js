const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/analyze', require('./routes/analyze'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'trinethra-server', timestamp: new Date().toISOString() });
});

// Sample transcripts endpoint (for the "Load Sample" feature in UI)
app.get('/api/samples', (req, res) => {
  try {
    const samples = require('./data/sample-transcripts.json');
    res.json(samples);
  } catch (err) {
    res.status(500).json({ error: 'Could not load sample transcripts' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🔺 Trinethra server running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Ollama: ${process.env.OLLAMA_URL || 'http://localhost:11434'}\n`);
});
