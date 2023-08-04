const puppeteer = require("puppeteer-core");
const Tesseract = require("tesseract.js");
const fs = require("fs").promises;

const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const path = require("path");

//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//rendering form.ejs
app.get("/", function (req, res) {
  res.render("form");
});

let captcha, examcode;

//creating form
app.post("/attendance", function (req, res) {
  captcha = req.body.captcha;
  examcode = req.body.examcode;
  res.send("<h1>Form submitted. Redirecting...</h1>");
});

// Starting the server at port 3000
app.listen(3000, function () {
  console.log("Server running on port 3000");
});

const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
};

const img = "https://www.iemcrp.com/captcha";
const website = "https://www.iemcrp.com/iemEn/ct304.jsp";
const formUrl = "http://localhost:3000/";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const enrollmentNo = "12021002029149";
const password = "Pranayg02$";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', // Use the default system-installed browser
    headless: false, // Adjust as needed
    // slowMo: 250 // slow down by 250ms
  });
  const browserContext = browser.defaultBrowserContext();
  await browserContext.overridePermissions(website, ["geolocation"]);
  const page = await browserContext.newPage();
  const captchaPage = await browserContext.newPage();
  const formPage = await browserContext.newPage();
  await page.setGeolocation({ latitude: 22.560187, longitude: 88.489983 });
  await page.goto(website);
  await page.waitForSelector(`#FORM1 > fieldset > img`, { visible: true });
  await captchaPage.goto(img);
  await captchaPage.evaluate(() => (document.body.style.zoom = 5));
  await captchaPage.screenshot({ path: "./public/images/captcha.png" });
  await captchaPage.close();
//   const captchaImg = await fs.readFile("./public/images/captcha.png");
//   console.log("Captcha image loaded", captchaImg);
//   const t = await Tesseract.recognize(captchaImg, "eng", config);
//   console.log("Tesseract OCR Result:", t.data);
//   const text = t.data.text.trim();
//   console.log("Extracted Captcha:", text);
    
await formPage.goto(formUrl);
  await wait(20000);
  await formPage.close();
  console.log(captcha, examcode);
  await page.waitForSelector(`#FORM1 > fieldset > #text1`, { visible: true });
  await page.waitForSelector(`#FORM1 > fieldset > #text2`, { visible: true });
  await page.waitForSelector(`#FORM1 > fieldset > #text3`, { visible: true });
  await page.waitForSelector(`#FORM1 > fieldset > #submit1`, { visible: true });
  await page.type(`#FORM1 > fieldset > #text1`, enrollmentNo);
  await page.type(`#FORM1 > fieldset > #text2`, password);
  await page.type(`#FORM1 > fieldset > #text3`, captcha.trim());
  const [res] = await Promise.all([
    page.waitForNavigation(), // The promise resolves after navigation has finished
    page.click(`#FORM1 > fieldset > #submit1`)
  ]);
  await page.waitForSelector(`#excode`, { visible: true });
  await page.waitForSelector(`#sub1`, { visible: true });
    await page.type(`#excode`, examcode.trim());
    const [res1] = await Promise.all([
        page.waitForNavigation(),
        page.click(`#sub1`)
    ]);
    console.log(res1.url());
    await page.waitForSelector(`#fr1 > .rating > #star3`, { visible: true });
    await page.waitForSelector(`#fr1 #sub1`, { visible: true });
    await page.click(`#fr1 > .rating > #star3`);
    const [res2] = await Promise.all([
        page.waitForNavigation(),
        page.click(`#fr1 #sub1`)
    ]);
    await wait(60000);
    browser.close();
})();