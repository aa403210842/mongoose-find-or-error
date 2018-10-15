const _ = require('lodash')
// const Promise = require('bluebird')

/**
 * http://mongoosejs.com/docs/api.html#model_Model.findOne
 *
 * @param {Object} options
 * @param {string} [options.static.findOne=findOneOrError] findOne function
 * @param {string} [options.static.findById=findByIdOrError] findById function
 * @param {string} [options.query.queryFname=throwEmpty] query helpers function
 * @param {string} [options.query.queryOption=emptyError] option field 
 *
 * @example
 * Query Helpers (findOne,findById)
 *  1. Model.findOne({_id: xxx}, '_id', {emptyError:true}, callback)
 *  2. Model.findOne({_id: xxx}).throwEmpty().then()
 *  3. Model.findOne({_id: xxx}, '_id', {emptyError:true}).then()
 *
 * Statics Method (findOneOrError,findByIdOrError)
 *  1. Model.findOneOrError({_id: xxx}, callback)
 *  2. Model.findOneOrError({_id: xxx}, { _id: 1 }, callback)
 *  3. Model.findOneOrError({_id: xxx}, '_id', {lean:true}, callback)
 *  4. Model.findOneOrError({_id: xxx}).then()
 *  5. Model.findOneOrError({_id: xxx}, { _id: 1 }).then()
 *  6. Model.findOneOrError({_id: xxx}, '_id', {lean:true}).then()
 */
function findOrErrorPlugin (schema, options) {
  options = _.merge({
    static: { 
      findOneFname: 'findOneOrError',
      findByIdFname: 'findByIdOrError'
    },
    query: {
      queryFname: 'throwEmpty',
      queryOption: 'emptyError'
    }
  }, options)

  const sendEmptyError = options.sendEmptyError || defaultSendEmptyError

  const queryOption = _.get(options, 'query.queryOption', 'emptyError')
  const queryFname = _.get(options, 'query.queryFname')

  const findOneFname = _.get(options, 'static.findOneFname')
  const findByIdFname = _.get(options, 'static.findByIdFname') 

  if (findOneFname) {
    schema.statics[findOneFname] = staticFindOneOrError('findOne', queryOption)
  }
  if (findByIdFname) {
    schema.statics[findByIdFname] = staticFindOneOrError('findById', queryOption)
  }

  if (queryFname) {
    schema.query[queryFname] = function (ifThrow = true) {
      return this.setOptions({ [queryOption]: ifThrow })
    }
  }
  
  schema.post('findOne', queryFindOneOrError(sendEmptyError, queryOption))
}

function queryFindOneOrError (sendEmptyError, queryOption) {
  return function _queryFindOneOrError(doc) {
    const modelName = this.model.modelName
    const emptyQueryOption = this.options[queryOption]

    if (!doc && emptyQueryOption) {
      throw sendEmptyError(modelName, this.getQuery(), emptyQueryOption)
    }
  }
}


function staticFindOneOrError (methed, queryOption) {
  return function _staticFindOneOrError (...args) {
    const self = this
    const done = args.pop()

    if (typeof done === 'function') {
      const emptyError = _.get(args, `2.${queryOption}`, true)
      _.set(args, `2.${queryOption}`, emptyError) // set option

      self[methed](...args, function(err, doc) {
        if (err) { return done(err) }
        return done(null, doc)
      })
    } else {
      if (!_.isUndefined(done)) {
        args.push(done)
      }
      const emptyError = _.get(args, `2.${queryOption}`, true)
      _.set(args, `2.${queryOption}`, emptyError) // set option

      return new Promise(function(resolve, reject) {
        self[methed](...args).exec().then(resolve).catch(reject)
      })
    }
  }
}

function defaultSendEmptyError (modelName, query, emptyQueryOption) {
  const error = new Error(`${_.upperFirst(_.camelCase(modelName))} not found.`)
  error.name = 'DocumentNotFoundError'
  if (!_.isBoolean(emptyQueryOption)) { error.code = emptyQueryOption }
  return error
}

module.exports = findOrErrorPlugin
