import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { username = "edwinkamau-8497", theme = "dark" } = req.query;
    const url = `https://learn.microsoft.com/en-us/users/${username}/`;

    // Fetch the Microsoft Learn profile
    const response = await fetch(url, {
      headers: {
        // Some sites require a User-Agent
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    // Handle non-200 responses
    if (!response.ok) {
      const statusText = response.status === 404 ? "Profile not found" : `HTTP ${response.status}`;
      throw new Error(statusText);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract points and level using regex
    const pointsMatch = html.match(/([\d,]+) points/i);
    const levelMatch = html.match(/Level (\d+)/i);
    const points = pointsMatch ? pointsMatch[1] : "0";
    const level = levelMatch ? levelMatch[1] : "0";

    // Count trophies and badges
    const trophies = $("img[alt='Trophy']").length;
    const badges = $("img[alt='Badge']").length;

    // Build SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" role="img">
        <rect width="100%" height="100%" fill="${theme === "dark" ? "#0d1117" : "#fff"}" rx="10" />
        <text x="50%" y="35" text-anchor="middle" font-size="20" fill="${theme === "dark" ? "#fff" : "#000"}" font-family="Segoe UI, sans-serif">Microsoft Learn Stats</text>

        <text x="20" y="70" font-size="16" fill="${theme === "dark" ? "#58a6ff" : "#0078d4"}">🏅 Points:</text>
        <text x="150" y="70" font-size="16" fill="${theme === "dark" ? "#fff" : "#000"}">${points}</text>

        <text x="20" y="100" font-size="16" fill="${theme === "dark" ? "#58a6ff" : "#0078d4"}">🎯 Level:</text>
        <text x="150" y="100" font-size="16" fill="${theme === "dark" ? "#fff" : "#000"}">${level}</text>

        <text x="20" y="130" font-size="16" fill="${theme === "dark" ? "#58a6ff" : "#0078d4"}">🏆 Trophies:</text>
        <text x="150" y="130" font-size="16" fill="${theme === "dark" ? "#fff" : "#000"}">${trophies}</text>

        <text x="20" y="160" font-size="16" fill="${theme === "dark" ? "#58a6ff" : "#0078d4"}">🎓 Badges:</text>
        <text x="150" y="160" font-size="16" fill="${theme === "dark" ? "#fff" : "#000"}">${badges}</text>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);

  } catch (error) {
    // Graceful error SVG
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
        <rect width="100%" height="100%" fill="red" rx="10" />
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="16">
          ${error.message}
        </text>
      </svg>
    `);
  }
}
