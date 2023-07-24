const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const cron = require("node-cron");
const express = require("express"); // Import the Express library

const app = express(); // Create an instance of Express app

// Your Puppeteer script function
async function runPuppeteer() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://learnwebcode.github.io/practice-requests/");

  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".info strong")).map(
      (x) => x.textContent
    );
  });
  await fs.writeFile("names.txt", names.join("\r\n"));

  const photos = await page.$$eval("img", (imgs) => {
    return imgs.map((x) => x.src);
  });

  for (const photo of photos) {
    const imagePage = await page.goto(photo);
    await fs.writeFile(photo.split("/").pop(), await imagePage.buffer());
  }

  await browser.close();
}

// HTTP route to trigger the Puppeteer script
app.get("/run-puppeteer", async (req, res) => {
  try {
    await runPuppeteer();
    res.send("Puppeteer script executed successfully!");
  } catch (error) {
    console.error("Error executing Puppeteer script:", error);
    res.status(500).send("An error occurred while running the Puppeteer script.");
  }
});

// Uncomment the following line to schedule the cron job
// to run the script every 5 seconds.
// cron.schedule("*/5 * * * * *", runPuppeteer);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// cron.schedule("*/5 * * * * *",start)