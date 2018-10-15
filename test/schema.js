const mongoose = require('mongoose')
const findOrErrorPlugin = require('../plugin')
// 01
const example01Schema = new mongoose.Schema({
  name: String,
  description: String
});
example01Schema.plugin(findOrErrorPlugin);
const Example1  = mongoose.model('Example01', example01Schema);
// 02
const example02Schema = new mongoose.Schema({
  name: String,
  description: String
});
example02Schema.plugin(findOrErrorPlugin, {
  sendEmptyError: function(modelName, query) {
    const error = new Error(modelName + ' notFound')
    error.name = 'NotFoundError'
    return error
  }
});
const Example2  = mongoose.model('Example02', example02Schema);

// 03
const example03Schema = new mongoose.Schema({
  name: String,
  description: String
});
example03Schema.plugin(findOrErrorPlugin, {
  static: false
});
const Example3  = mongoose.model('Example03', example03Schema);

module.exports = {
  Example1,
  Example2,
  Example3
}