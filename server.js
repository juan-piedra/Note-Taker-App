// Importing the Express module
const express = require("express");

// Importing the File System module
const fs = require("fs");

// Importing the Path module
const path = require("path");

// Importing the Uniqid module
const uniqid = require("uniqid");

// Defining the port number for the server
const PORT = process.env.PORT || 3001;

// Creating a new Express app
const app = express();

// Middleware for parsing JSON data
app.use(express.json());

// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serving static files from the "Develop/public" directory
app.use(express.static("Develop/public"));

// Route for serving the index.html page
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "Develop/public/index.html"))
);

// Route for serving the notes.html page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "Develop/public/notes.html"))
);

// Route for retrieving the parsed JSON data from the db.json file
app.get("/api/notes", function (req, res) {
  fs.readFile("Develop/db/db.json", "utf8", (err, data) => {
    var jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

// Function for reading the file, appending new content, and writing it back to the file
const readThenAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      createNewNote(file, parsedData);
    }
  });
};

// Function for writing data to the file
const createNewNote = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

// Route for adding a new note
app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;
  if (title && text) {
    const newNote = {
      title: title,
      text: text,
      id: uniqid(),
    };

    readThenAppend(newNote, "Develop/db/db.json");

    const response = {
      status: "success",
      body: newNote,
    };

    res.json(response);
  } else {
    res.json("Error in posting new note");
  }
});

// Route for deleting a note
app.delete("/api/notes/:id", (req, res) => {
  let id = req.params.id;
  let parsedData;
  fs.readFile("Develop/db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      parsedData = JSON.parse(data);
      const filterData = parsedData.filter((note) => note.id !== id);
      createNewNote("Develop/db/db.json", filterData);
    }
  });
  res.send(`Deleted note with ${req.params.id}`);
});

// Starting the server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
