const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const publicDirectory = path.join(projectRoot, "public");
const publicFiles = [
  "index (4).html",
  "admin.html",
  "admin.js",
  "public-content.js",
  "supabase-config.js",
  "after.jpeg",
  "before&after.jpg",
  "bike.jpeg",
  "bike2.jpeg",
  "caleb.png",
  "clip1.mp4",
  "favicon-96x96.png",
];

fs.mkdirSync(publicDirectory, { recursive: true });
const adminDirectory = path.join(publicDirectory, "admin");
fs.mkdirSync(adminDirectory, { recursive: true });

for (const file of publicFiles) {
  const source = path.join(projectRoot, file);
  const destinationName = file === "index (4).html" ? "index.html" : file;
  fs.copyFileSync(source, path.join(publicDirectory, destinationName));
}

fs.copyFileSync(
  path.join(projectRoot, "admin.html"),
  path.join(adminDirectory, "index.html")
);
