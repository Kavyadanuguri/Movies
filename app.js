const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
app.use(express.json());
const dbpath = path.join(__dirname, "moviesData.db");
let db = null;

const InitializeAndStartServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`dberror : ${e.message}`);
    process.exit(1);
  }
};
InitializeAndStartServer();

const convertToCamelCase = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieNames = `
        SELECT movie_name
        from movie
    `;
  const movieNames = await db.all(getMovieNames);

  response.send(movieNames.map((each) => convertToCamelCase(each)));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovie = `
      INSERT INTO
      movie (director_id, movie_name, lead_actor)
      VALUES
      (
          ${directorId},
         '${movieName}',
         '${leadActor}'
      );`;
  await db.run(addMovie);
  response.send("Movie Successfully Added");
});

const convertToCamelCase1 = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
        SELECT *
        from movie
        where
        movie_id = ${movieId};`;

  const movieName = await db.get(getMovie);
  response.send(convertToCamelCase1(movieName));
});

//API PUT
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieDetails = `
        UPDATE
          movie
        SET
         director_id = ${directorId},
         movie_name = '${movieName}',
         lead_actor = '${leadActor}'
        WHERE
         movie_id = ${movieId};`;

  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

//API DELETE
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteDetails = `
     DELETE FROM 
        movie
     WHERE 
        movie_id = ${movieId};`;
  await db.run(deleteDetails);
  response.send("Movie Removed");
});

const convertToCamelCase2 = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorNames = `
        SELECT director_id, director_name
        from director;`;

  const directorNames = await db.all(getDirectorNames);
  response.send(directorNames.map((each) => convertToCamelCase2(each)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNames = `
        SELECT movie_name
        from movie
        where 
        director_id = ${directorId};`;

  const movieNames = await db.all(getMovieNames);
  response.send(movieNames.map((each) => convertToCamelCase(each)));
});

module.exports = app;
