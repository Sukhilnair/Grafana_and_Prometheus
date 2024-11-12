const express = require('express')
const cors = require('cors')
const client = require('prom-client')
require('dotenv').config()

const app = express()
PORT = process.env.PORT
const conn = require('./conn')
app.use(express.json())
app.use(cors())

const tripRoutes = require('./routes/trip.routes')

client.collectDefaultMetrics();

// Custom metrics
const requestCount = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'route', 'status']
});

const requestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

// Middleware to measure request duration
app.use((req, res, next) => {
  const end = requestDuration.startTimer();
  res.on('finish', () => {
    requestCount.inc({ method: req.method, route: req.path, status: res.statusCode });
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Expose `/metrics` endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

// Example route
app.get('/example', (req, res) => {
  res.send('Hello, world!');
});
app.use('/trip', tripRoutes) // http://localhost:3001/trip --> POST/GET/GET by ID

app.get('/hello', (req,res)=>{
    res.send('Hello World!')
})

app.listen(PORT, ()=>{
    console.log(`Server started at http://localhost:${PORT}`)
})
