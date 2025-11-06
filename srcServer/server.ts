
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import users from "./routes/users.js";
import channels from "./routes/channels.js";
import messages from "./routes/messages.js";
import login from "./auth/login.js";
import register from "./auth/register.js";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ✅ Simple logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ✅ API routes
app.use("/api/users", users);
app.use("/api/channels", channels);
app.use("/api/messages", messages);
app.use("/api/auth/login", login);
app.use("/api/auth/register", register);

// ✅ Serve frontend (Render-friendly absolute path)
const frontendPath = path.resolve("dist");
app.use(express.static(frontendPath));

// ✅ Catch-all route for React Router
app.get("/*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ Start server
console.log("🚀 Server starting...");
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
