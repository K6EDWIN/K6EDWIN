import requests
from bs4 import BeautifulSoup
import re
import matplotlib.pyplot as plt

URL = "https://learn.microsoft.com/en-us/users/edwinkamau-8497/"
r = requests.get(URL)
soup = BeautifulSoup(r.text, "lxml")

# --- Extract stats ---
points_match = re.search(r"(\d[\d,]*) points", r.text)
level_match = re.search(r"Level (\d+)", r.text)
points = int(points_match.group(1).replace(",", "")) if points_match else 0
level = int(level_match.group(1)) if level_match else 0

trophies = len(soup.find_all("img", {"alt": "Trophy"}))
badges = len(soup.find_all("img", {"alt": "Badge"}))

# --- Estimate next level (assume 10k pts per level) ---
points_per_level = 10000
next_level_target = (level + 1) * points_per_level
progress = points - (level * points_per_level)
progress_percent = (progress / points_per_level) * 100

# --- Create chart ---
fig, ax = plt.subplots(figsize=(6, 4))

ax.barh(["Progress to Next Level"], [progress], color="royalblue")
ax.barh(["Progress to Next Level"], [points_per_level], color="lightgray", alpha=0.3)

ax.set_xlim(0, points_per_level)
ax.set_title(f"Microsoft Learn – Level {level} | {points} pts", fontsize=14)
ax.text(progress, 0, f" {progress_percent:.1f}%", va="center", fontsize=12, color="black")

plt.tight_layout()
plt.savefig("learn_stats.png")
