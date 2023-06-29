const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const path = require('path');

app.use(bodyParser.json());

// Use in-memory array for users
let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: ["The Last Waltz"]
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: []
  },
];

// Use in-memory array for movies
let movies = [
  {
    title: "The Last Waltz",
    description: "A legendary farewell concert by The Band featuring various guest artists.",
    year: 1978,
    genre: {
      name: "Rock, Documentary",
      description: "Combines elements of rock music and documentary filmmaking to capture the essence of the concert."
    },
    director: {
      name: "Martin Scorsese"
    },
    imageURL: ""
  },
  {
    title: "Stop Making Sense",
    description: "An iconic live performance by Talking Heads, known for its innovative staging and energetic performances.",
    year: 1984,
    genre: {
      name: "Rock, New Wave",
      description: "Blends the rock genre with elements of punk, art, and pop music, characterized by its unique style and energy."
    },
    director: {
      name: "Jonathan Demme"
    },
    imageURL: ""
  },
  {
    title: "Woodstock",
    description: "The famous music festival held in 1969, capturing the spirit of the counterculture movement.",
    year: 1970,
    genre: {
      name: "Documentary, Music",
      description: "Combines the documentary format with live music performances, providing a comprehensive experience of the festival."
    },
    director: {
      name: "Michael Wadleigh"
    },
    imageURL: ""
  },
  {
    title: "Pulse",
    description: "Pink Floyd's stunning concert in London featuring their classic hits and elaborate stage effects.",
    year: 1995,
    genre: {
      name: "Progressive Rock",
      description: "Pushes the boundaries of rock music by incorporating complex musical structures and conceptual themes."
    },
    director: "David Mallet",
    imageURL: ""
  },
  {
    title: "Monterey Pop",
    description: "A groundbreaking documentary capturing the performances at the 1967 Monterey Pop Festival, including Jimi Hendrix, Janis Joplin, and The Who.",
    year: 1968,
    genre: {
      name: "Documentary, Music",
      description: "Provides an immersive experience of the historic music festival, showcasing iconic performances and cultural moments."
    },
    director: {
      name: "D.A. Pennebaker"
    },
    imageURL: ""
  },
  {
    title: "Shine a Light",
    description: "Martin Scorsese directs this concert film featuring The Rolling Stones performing live in New York City.",
    year: 2008,
    genre: {
      name: "Rock, Documentary",
      description: "Offers a glimpse into the rock 'n' roll world through the electrifying performances of The Rolling Stones."
    },
    director: {
      name: "Martin Scorsese",
    },
    imageURL: ""
  },
  {
    title: "Gimme Shelter",
    description: "A documentary that chronicles The Rolling Stones' 1969 American tour, culminating in the infamous Altamont Free Concert.",
    year: 1970,
    genre: {
      name: "Documentary, Music",
      description: "Explores the intersection of music and social unrest, capturing a pivotal moment in rock history."
    },
    director: {
      name: "Albert and David Maysles"
    },
    imageURL: ""
  },
  {
    title: "Live at Pompeii",
    description: "Pink Floyd's iconic concert film, capturing their performances in an ancient Roman amphitheater in Pompeii.",
    year: 1972,
    genre: {
      name: "Progressive Rock",
      description: "Showcases Pink Floyd's progressive rock soundscapes and mesmerizing visuals, set against the backdrop of Pompeii's historic ruins."
    },
    director: {
      name: "Adrian Maben"
    },
    imageURL: ""
  },
  {
    title: "The Song Remains the Same",
    description: "Led Zeppelin's concert film featuring footage from their 1973 performances at Madison Square Garden in New York City.",
    year: 1976,
    genre: {
      name: "Rock",
      description: "Presents Led Zeppelin's energetic live performances, capturing the essence of their iconic rock music."
    },
    director: {
      name: "Peter Clifton, Joe Massot"
    },
    imageURL: ""
  },
  {
    title: "Rattle and Hum",
    description: "U2's exploration of American music and culture during their 1987 Joshua Tree Tour, featuring live performances and documentary segments.",
    year: 1988,
    genre: {
      name: "Rock, Documentary",
      description: "Blends U2's passionate rock music with insightful glimpses into American history and society."
    },
    director: {
      name: "Phil Joanou"
    },
    imageURL: ""
  }
];

// Set up Morgan middleware to log all requests
app.use(morgan('combined'));

app.get('/', (req, res) => {
  res.send('Welcome to FlickPick!');
});

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.use(express.static('public'));

app.get('/documentation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'documentation.html'));
});

// Error-handling middleware
app.use((err, req, res, next) => {
  // Log the error to the terminal
  console.error(err);

  // Send an error response to the client
  res.status(500).send('Internal Server Error');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
