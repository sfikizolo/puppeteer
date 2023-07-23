const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const cron = require("node-cron")


async function start(){

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://learnwebcode.github.io/practice-requests/")

    const names = await page.evaluate(() =>{
        return Array.from(document.querySelectorAll(".info strong")).map(x => x.textContent)
    })
    await fs.writeFile('names.txt',names.join('\r\n'))


    const photos = await page.$$eval("img",(imgs)=>{
        return imgs.map(x => x.src)

    })

    for (const photo of photos){
        const imaagepage = await page.goto(photo);
        await fs.writeFile(photo.split("/").pop(),await imaagepage.buffer())
    }


    await browser.close();

}


start()

// cron.schedule("*/5 * * * * *",start)