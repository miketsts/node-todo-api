var mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(uri);

module.exports = { mongoose };
