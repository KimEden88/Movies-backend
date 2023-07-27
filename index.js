const express = require('express');
require('dotenv/config');

// BE app:
const app = express();
const PORT = process.env.PORT || 8000;
const { Pool } = require('pg');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Database:
const pool = new Pool({
  connectionString: process.env.ELEPHANT_SQL_CONECTION_STRING,
});

// Get all movies:
app.get('/api/movies', (req, res) => {
  pool
    .query('SELECT * FROM movies;')
    .then((data) => {
      console.log(data);
      res.json(data.rows);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});
