const express = require('express');

// BE app:
const app = express();
require('dotenv/config');
const PORT = process.env.PORT || 8000;
const { Pool } = require('pg');
const cors = require('cors');

// Database:
const pool = new Pool({
  connectionString: process.env.ELEPHANT_SQL_CONECTION_STRING,
});

app.use(cors());
app.use(express.json());

//CRUD
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

app.listen(PORT, () => console.log(`SERVER IS UP ON ${PORT}`));

// Get movie by id:
app.get('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  const safeValues = [id]; //this need to be array!!
  pool
    .query('SELECT * FROM movies WHERE id=$1;', safeValues)
    .then(({ rowCount, rows }) => {
      if (rowCount === 0) {
        res.status(404).json({ message: `Movie with id ${id} Not Found` });
      } else {
        console.log(rows);
        res.json(rows[0]);
      }
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

// Add movie:
app.post('/api/movies', (req, res) => {
  const { title, director, year, genre, rating, poster, plot } = req.body;

  const safeValues = [
    title,
    director,
    year,
    genre ?? '',
    poster ?? '',
    rating ?? 0,
    plot,
  ];

  pool
    .query(
      'INSERT INTO movies (title,director,year,genre,poster,rating,plot) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;',
      safeValues
    )
    .then(({ rows }) => {
      console.log(rows);
      res.status(201).json(rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

// Update movie:
app.put('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  const { title, director, year, genre, rating, poster, plot } = req.body;
  const safeValues = [title, director, year, genre, rating, poster, plot, id];
  pool
    .query(
      'UPDATE movies SET title=$1,director=$2,year=$3,genre=$4,rating=$5,poster=$6,plot=$7 WHERE id=$8 RETURNING *;',
      safeValues
    )
    .then(({ rows }) => {
      console.log(rows);
      res.status(202).json(rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

// Delete movie:
app.delete('/api/movies/:id', (req, res) => {
  const { id } = req.params;
  const safeValues = [id];
  pool
    .query('DELETE FROM movies WHERE id=$1 RETURNING *;', safeValues)
    .then(({ rows }) => {
      console.log(rows);
      res.json(rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});
