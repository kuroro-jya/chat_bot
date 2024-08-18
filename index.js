/* eslint-disable max-len */
const fs = require("fs");
const _ = require("lodash");
const wiki = require("wikipedia");
const convert = require("convert-units");
const { lowerCase } = require("lower-case");
const { capitalCase } = require("change-case");
const extractValues = require("extract-values");
const stringSimilarity = require("string-similarity");
const { upperCaseFirst } = require("upper-case-first");

const cors = require("cors");
const path = require("path");
const axios = require("axios");
const morgan = require("morgan");
const dotenv = require("dotenv");
const express = require("express");
const compression = require("compression");
const serveStatic = require("serve-static");

const pkg = require("./package.json");
const welcomeChat = require("./intents/Default_Welcome.json");

dotenv.config();

const standardRating = 0.6;
const botName = process.env.BOT_NAME || pkg.name;
const developerName = process.env.DEVELOPER_NAME || pkg.author.name;
const developerEmail = process.env.DEVELOPER_EMAIL || pkg.author.email;
const bugReportUrl = process.env.DEVELOPER_NAME || pkg.bugs.url;

const app = express();
const port = process.env.PORT || 3000;

const sendWelcomeMessage = (req, res) => {
  res.json({
    responseText: _.sample(welcomeChat),
  });
};

const sendModelAnswer = (req, res) => {

  query = decodeURIComponent(req.query.q).replace(/\s+/g, " ").trim() || "Hello";
  query = lowerCase(query.replace(/(\?|\.|!)$/gim, ""));
  role = decodeURIComponent(req.query.r);
  mode = decodeURIComponent(req.query.m);

  fetch('http://127.0.0.1/find?question='+query+'&role='+role+'&mode='+mode)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    answer = myJson.result;
    res.json({
    responseText: answer,
    });
  });

};

const regenerateAnswer = (req, res) => {

  query = decodeURIComponent(req.query.q).replace(/\s+/g, " ").trim() || "Hello";
  query = lowerCase(query.replace(/(\?|\.|!)$/gim, ""));
  role = decodeURIComponent(req.query.r);
  mode = decodeURIComponent(req.query.m);
  counter = decodeURIComponent(req.query.c);

  fetch('http://127.0.0.1/refind?question='+query+'&role='+role+'&counter='+counter+'&mode='+mode)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    answer = myJson.result;
    res.json({
    responseText: answer,
    });
  });

};


const sendModelFeedback = (req, res) => {

  question = decodeURIComponent(req.query.question);
  role = decodeURIComponent(req.query.role);
  response = decodeURIComponent(req.query.r);
  feedback = decodeURIComponent(req.query.feedback);
  fetch('http://127.0.0.1/feedback?question='+question+'&role='+role+'&response='+response+'&feedback='+feedback)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    answer = myJson.result;
    res.json({
    responseText: answer,
    });
  });

};

app.use(cors());
app.use(compression());
app.set("json spaces", 4);
app.use("/api/", morgan("tiny"));
app.get("/api/question", sendModelAnswer);
app.get("/api/regenerate",regenerateAnswer);
app.get("/api/feedback", sendModelFeedback);
app.get("/api/welcome", sendWelcomeMessage);
app.use(serveStatic(path.join(__dirname, "public")));

app.listen(port, () => console.log(`app listening on port ${port}!`));
