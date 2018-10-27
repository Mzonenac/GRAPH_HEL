const server = require('./server');
const body = require('./data-json')

const event = {
    body: JSON.stringify(body)
};

module.exports = event;

