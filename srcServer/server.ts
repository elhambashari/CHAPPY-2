
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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});


app.use("/api/users", users);
app.use("/api/channels", channels);
app.use("/api/messages", messages);
app.use("/api/auth/login", login);
app.use("/api/auth/register", register);


const frontendPath = path.resolve("./dist");


app.use(express.static(frontendPath));


app.get(/^\/(?!api).*/, (req, res) => {

  res.sendFile(path.join(frontendPath, "index.html"));
});


console.log("🚀 Server starting...");
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
