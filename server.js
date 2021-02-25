const express = require('express');
const {join} = require('path');
const logger = require('./lib/logger');

const app = express();
const PORT = 8888;

app.use(logger(':method :url'));

app.use(express.static(join(__dirname, 'public')));

app.listen(PORT, () => logger(':start :port=' + PORT));