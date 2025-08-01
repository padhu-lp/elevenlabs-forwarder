const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('Webhook forwarder is running! Send a POST request to this URL.');
});

// Main webhook handler - ElevenLabs to n8n forwarder Test
app.post('/', async (req, res) => {
  try {
    // Get the request body from ElevenLabs
    const body = req.body;
    console.log('Received data:', body);

    // Process email addresses if needed
    if (body.text) {
      body.text = body.text.replace(/(\S+)\s+at\s+(\S+)\s+dot\s+(\S+)/gi, '$1@$2.$3')
        .replace(/(\S+)\s+at\s+(\S+\.\S+)/gi, '$1@$2');
      console.log('Processed text:', body.text);
    }

    // Forward to n8n
    const response = await fetch('https://n8n.padmanabhan.me/webhook/Travel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PostmanRuntime/7.39.0',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log('n8n response:', response.status, responseText);

    res.status(200).json({
      status: 'success',
      message: 'Data forwarded to n8n',
      n8n_response: responseText
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to forward data',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
