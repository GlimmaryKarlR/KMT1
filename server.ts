import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import https from "https";
import { parse } from "csv-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_URL = "https://zenodo.org/records/19376238/files/KMT_REACTION_MANIFOLD_01_12d_chem_mesh.csv?download=1";
const DATA_PATH = path.join(__dirname, "kmt_manifold.csv");

async function downloadFile(url: string, targetPath: string) {
  if (fs.existsSync(targetPath)) {
    console.log("Dataset already exists.");
    return;
  }

  console.log("Downloading dataset (167MB)... This may take a moment.");
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(targetPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200 && response.statusCode !== 302) {
        // Handle Zenodo redirects
        if (response.headers.location) {
          downloadFile(response.headers.location, targetPath).then(resolve).catch(reject);
          return;
        }
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log("Download complete.");
        resolve(true);
      });
    }).on("error", (err) => {
      fs.unlinkSync(targetPath);
      reject(err);
    });
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Download data in background if needed
  downloadFile(DATA_URL, DATA_PATH).catch(console.error);

  app.use(express.json());

  // API Routes
  app.get("/api/reaction/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid reaction index" });

    // Stream CSV to find the specific row (t = index)
    // For 1.44M rows, we might want to optimize this with an index or binary search
    // but initially, we'll try a stream-scan.
    let found = false;
    const parser = fs.createReadStream(DATA_PATH).pipe(parse({ columns: true, cast: true }));

    for await (const record of parser) {
      if (record.t === id) {
        res.json(record);
        found = true;
        break;
      }
      // Speed up if we passed it (assuming 't' is sequential)
      if (record.t > id) break;
    }

    if (!found) res.status(404).json({ error: "Reaction not found" });
  });

  app.get("/api/kinematics", async (req, res) => {
    const interval = 100;
    const limit = 1000; // Return first 1000 items at interval 100
    const results: any[] = [];
    
    if (!fs.existsSync(DATA_PATH)) return res.status(503).json({ error: "Data downloading" });

    const parser = fs.createReadStream(DATA_PATH).pipe(parse({ columns: true, cast: true }));
    let count = 0;
    for await (const record of parser) {
      if (record.t % interval === 0) {
        results.push(record);
      }
      if (results.length >= limit) break;
    }
    res.json(results);
  });

  app.get("/api/neighborhood/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const radius = 50; // Capture 50 reactions before and after for "neighborhood"
    const results: any[] = [];

    if (!fs.existsSync(DATA_PATH)) return res.status(503).json({ error: "Data downloading" });

    const parser = fs.createReadStream(DATA_PATH).pipe(parse({ columns: true, cast: true }));
    for await (const record of parser) {
      if (record.t >= id - radius && record.t <= id + radius) {
        results.push(record);
      }
      if (record.t > id + radius) break;
    }
    res.json(results);
  });

  // Global mean proxy (hardcoded or calculated once)
  app.get("/api/stats", (req, res) => {
    res.json({
        globalMeanD: 5.4, // Example placeholder, usually calculated from dataset
        densityScale: "Standard Organic Manifold",
        chemicalCliffThreshold: 15.0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
