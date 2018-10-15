# mongoose-findone-or-error

Simple Mongoose plugin for rejecting findOne and findById promises which resolve null.

# Installation

Hook the plugin to a schema:

```javascript
// global level
const mongoose = require('mongoose');
const findOrErrorPlugin = require('mongoose-findone-or-error');
mongoose.plugin(findOrErrorPlugin);

// schema level
// example.js

const mongoose = require('mongoose');
const findOrErrorPlugin = require('mongoose-findone-or-error');

const schema = new mongoose.Schema({
  name: String,
  description: String
});

schema.plugin(findOrErrorPlugin);

mongoose.model('Example', schema);
```
## Usage

#### Execute use statics method

```javascript
const Example = require('./example');

// use with statics findByIdOrError
// 1. Promise
Example.findByIdOrError('idNotInDatabase')
  .then(doc => {
    console.log('Only executed when document is found');
  })
  .catch(err => {
    console.log(err);
  });
 // 2. Callback
 Example.findByIdOrError('idNotInDatabase', function(err, doc) {
   if (err) {
     console.log('Here not found error');
     return
   }
   console.log('Only executed when document is found');
 })
  
 // or use with statics findOneOrError
 Example.findOneOrError({ name: 'plugin example' })
   .then(doc => {
     console.log('Only executed when document is found');
   })
   .catch(err => {
     console.log(err);
   });

  Example.findOneOrError({ name: 'plugin example' }, function(err, doc) {
   if (err) {
     console.log('Here not found error');
     return
   }
   console.log('Only executed when document is found');
 })

```

#### Execute use query helpers:

```javascript
const Example = require('./example');
  // 1. Promise
 Example.findOne({ name: 'plugin example' })
   .select({name: 1})
   .throwEmpty() // <- add this line before .then() or .exec()
   .limit(10)
   .then(doc => {
     console.log('Only executed when document is found');
   })
   .catch(err => {
     console.log(err);
   });
  // 2. Promise
  // or set option emptyError
  Example.findOne({ 
    name: 'plugin example' 
  }, null, {
    lean: true, // other option
    emptyError: true // <- add this option
  })
   .then(() => {
     console.log('Only executed when document is found');
   })
   .catch(err => {
     console.log(err);
   });
  // 3. Callback
  Example.findOne({ 
    name: 'plugin example' 
  }, '_id name', {
    emptyError: true // <- add this option
  }, function(err, doc) {
   if (err) {
     console.log('Here not found error');
     return
   }
   console.log('Only executed when document is found');
 })

 // findById same as findOne
 ...

```

#### Default Error Handle
```javascript
// modelName: return the mode name
// query: return Query.getQuery()
// emptyQueryOption: return Query.getOptions()[queryOption]

function defaultSendEmptyError (modelName, query, emptyQueryOption) {
  const error = new Error(`${_.upperFirst(_.camelCase(modelName))} not found.`)
  error.name = 'DocumentNotFoundError'
  if (!_.isBoolean(emptyQueryOption)) { error.code = emptyQueryOption }
  return error
}

```

## Plugin Options
```javascript
// default options
schema.plugin(findOrErrorPlugin, {
  static: { //  set `false` disable both findOneOrError and findByIdOrError
    findOneFname: 'findOneOrError', // custom function name or set `false` disable it
    findByIdFname: 'findByIdOrError' // custom function name or set `false` disable it
  },
  query: { //  set `false` disable query helpers
    queryFname: 'throwEmpty', // use .throwEmpty(true) or .throwEmpty(404)
    queryOption: 'emptyError' // use { emptyError: true } or  { emptyError: 404 }
  },
  sendEmptyError: sendEmptyError // must reutrn an instanceof Error
});
```

Error With `code`
```javascript
// .throwEmpty(code)
Example.findOne({ name: 'plugin example' })
   .select({name: 1})
   .throwEmpty(404) // set code to error.code
   .limit(10)
   .then(doc => {
     console.log('Only executed when document is found');
   })
   .catch(err => {
     console.log(err.code) // 404
   });


// { emptyError: code }
Example.findOne({ 
    name: 'plugin example' 
  }, '_id name', {
    emptyError: 404
  }, function(err, doc) {
   if (err) {
     console.log(err.code) // 404
     return
   }
   console.log('Only executed when document is found');
 })
```


## Running tests

```
npm test
```

