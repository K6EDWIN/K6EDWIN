import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { username = "edwinkamau-8497", theme = "dark" } = req.query;
  const url = `https://learn.microsoft.com/en-us/users/${username}/`;

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for XP or Points text to appear
    await page.waitForFunction(
      () =>
        document.body.innerText.match(/(\d[\d,]*)\s*(XP|points)/i) ||
        document.body.innerText.match(/Level\s*\d+/i),
      { timeout: 40000 }
    );

    const data = await page.evaluate(() => {
      const text = document.body.innerText;

      // match both XP or points variations
      const pointsMatch = text.match(/([\d,]+)\s*(XP|points)/i);
      const levelMatch = text.match(/Level\s*(\d+)/i);
      const trophiesMatch = text.match(/Trophies?\s*([\d,]+)/i);
      const badgesMatch = text.match(/Badges?\s*([\d,]+)/i);

      return {
        points: pointsMatch ? pointsMatch[1] : "0",
        level: levelMatch ? levelMatch[1] : "0",
        trophies: trophiesMatch ? trophiesMatch[1] : "0",
        badges: badgesMatch ? badgesMatch[1] : "0",
      };
    });

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" role="img">
        <rect width="100%" height="100%" fill="${theme === "dark" ? "#0d1117" : "#fff"}" rx="10" />
        <text x="50%" y="35" text-anchor="middle" font-size="20" fill="${
          theme === "dark" ? "#fff" : "#000"
        }" font-family="Segoe UI, sans-serif">Microsoft Learn Stats</text>

        <text x="20" y="70" font-size="16" fill="${
          theme === "dark" ? "#58a6ff" : "#0078d4"
        }">🏅 Points:</text>
        <text x="150" y="70" font-size="16" fill="${
          theme === "dark" ? "#fff" : "#000"
        }">${data.points}</text>

        <text x="20" y="100" font-size="16" fill="${
          theme === "dark" ? "#58a6ff" : "#0078d4"
        }">🎯 Level:</text>
        <text x="150" y="100" font-size="16" fill="${
          theme === "dark" ? "#fff" : "#000"
        }">${data.level}</text>

        <text x="20" y="130" font-size="16" fill="${
          theme === "dark" ? "#58a6ff" : "#0078d4"
        }">🏆 Trophies:</text>
        <text x="150" y="130" font-size="16" fill="${
          theme === "dark" ? "#fff" : "#000"
        }">${data.trophies}</text>

        <text x="20" y="160" font-size="16" fill="${
          theme === "dark" ? "#58a6ff" : "#0078d4"
        }">🎓 Badges:</text>
        <text x="150" y="160" font-size="16" fill="${
          theme === "dark" ? "#fff" : "#000"
        }">${data.badges}</text>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (err) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(500).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
        <rect width="100%" height="100%" fill="red" />
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="14">
          Error: ${err.message}
        </text>
      </svg>
    `);
  } finally {
    if (browser) await browser.close();
  }
}
