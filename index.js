const express = require("express");

// BE app:
const app = express();
require("dotenv/config");
const PORT = process.env.PORT || 8000;
const { Pool } = require("pg");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// Database:
const pool = new Pool({
  connectionString: process.env.ELEPHANT_SQL_CONECTION_STRING,
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

//CRUD
// Get all movies:
app.get("/api/movies", async (req, res) => {
  const movies = await prisma.movies.findMany();

  if (!movies) {
    res.status(404).json({ message: "No movies found" });
  }

  res.json(movies);
});

//Get 3 Random movies:
app.get("/api/movies/random", async (req, res) => {
  const ids =
    await prisma.$queryRaw`SELECT id FROM movies ORDER BY RAND() LIMIT ${3}`;

  await prisma.movies
    .findMany({
      where: {
        ids,
      },
      orderBy: {
        id: "asc",
      },
    })
    .then((data) => {
      console.log(data);
      res.json(data.rows);
    })
    .catch((e) => res.status(500).json({ message: e.message }));

  // pool
  //   .query('SELECT * FROM movies ORDER BY RANDOM() LIMIT 1;')
  //   .then((data) => {
  //     console.log(data);
  //     res.json(data.rows);
  //   })
  //   .catch((e) => res.status(500).json({ message: e.message }));
});

app.listen(PORT, () => console.log(`SERVER IS UP ON ${PORT}`));

// Get movie by id:
app.get("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  prisma.movies
    .findFirst({
      where: {
        id: Number(id),
      },
    })
    .then((movie) => {
      if (!movie) {
        res.status(404).json({ message: `Movie with id ${id} Not Found` });
      } else {
        res.json(movie);
      }
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

// Add movie:
app.post("/api/movies", (req, res) => {
  const { title, director, year, genre, rating, poster, plot, duration } =
    req.body;
  
  prisma.movies
    .create({
      data: {
        title,
        director,
        year,
        genre,
        rating,
        poster,
        plot,
        duration,
      },
    })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

// Update movie:
app.put("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, director, year, genre, rating, poster, plot, duration } =
    req.body;
  const safeValues = [
    title,
    director,
    year,
    genre,
    rating,
    poster,
    plot,
    duration,
    id,
  ];
  pool
    .query(
      "UPDATE movies SET title=$1,director=$2,year=$3,genre=$4,rating=$5,poster=$6,plot=$7,duration=$8 WHERE id=$9 RETURNING *;",
      safeValues
    )
    .then(({ rows }) => {
      console.log(rows);
      res.status(202).json(rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});

// Delete movie:
app.delete("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  const safeValues = [id];
  pool
    .query("DELETE FROM movies WHERE id=$1 RETURNING *;", safeValues)
    .then(({ rows }) => {
      console.log(rows);
      res.json(rows[0]);
    })
    .catch((e) => res.status(500).json({ message: e.message }));
});
