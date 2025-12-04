const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

// Serve static files from public folder
app.use(express.static("public"));

// --- Discord OAuth2 settings ---
// Replace these with your actual Discord app credentials
const CLIENT_ID = "1446207871007068170";
const CLIENT_SECRET = "W7B8N8toPhUupJKd6YGA4WaJziSMC449";
const REDIRECT_URI = "https://bubbas-best-friends.onrender.com/"; // replace with your Render URL

// Route: login button redirects here
app.get("/login", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(url);
});

// Route: Discord redirects here after login
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code provided");

  try {
    // Exchange code for access token
    const data = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    });

    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      data.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // Get user info from Discord
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });

    const user = userRes.data;

    // Display user info
    res.send(`
      <h1>Bubba's Best Friends!</h1>
      <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512" width="128">
      <p>${user.username}</p>
    `);
  } catch (err) {
    console.error(err);
    res.send("Error logging in");
  }
});

// Serve index.html for the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
