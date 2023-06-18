// Imports the HTTP and URL modules
const http = require('http');
const url = require('url');
const fs = require('fs');

// Function from the HTTP module with two arguments
http.createServer((request, response) => {

  // Parses the requested URL using the url.parse() method
  let addr = request.url;
  let q = url.parse(addr, true);

  // Determines the file path based on the parsed URL
  let filePath = '';

  // Checks if the pathname of the URL includes the word "documentation"
  if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html'); // Sets the file path to documentation.html
  } else {
    filePath = 'index.html'; // Sets the file path to index.html
  }

  // Reads the file specified by the filePath variable
  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err; // Throws an error if the file cannot be read
    }

    // Sets the response's status code and content type
    response.writeHead(200, { 'Content-Type': 'text/html' });

    // Writes the contents of the file to the response
    response.write(data);

    // Ends the response
    response.end();
  });

  // Listens for a response on port 8080
}).listen(8080);

console.log('My Node server is running on Port 8080.');
