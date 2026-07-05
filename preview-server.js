const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "public");
const port = 8787;
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".png": "image/png"
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    while (urlPath.startsWith("/")) urlPath = urlPath.slice(1);

    let filePath = path.resolve(root, urlPath);
    if (!(filePath === root || filePath.startsWith(root + path.sep))) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(res);
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Preview server running at http://127.0.0.1:${port}/`);
  });
