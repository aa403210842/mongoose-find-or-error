const mongoose = require('mongoose')
const expect = require('chai').expect

mongoose.Promise = global.Promise

const { Example1, Example2, Example3 } = require('./schema')

describe('Models Tests', function () {
  before(function () {
    return mongoose.connect('mongodb://localhost:27017/mongoose_findorerror', { useNewUrlParser: true })
    .then(() => {
      return mongoose.connection.db
      .dropDatabase()
    })
  })
  after(function() {
    return mongoose.disconnect()
  })

  describe('FindOrErrorPlugin Default Options', function () {
    before(function () {
      return Example1.create([
        { name: 'example 1' },
        { name: 'example 2' }
      ])
    })

    it('statics findOneOrError Promise', function() {
      return Example1.findOneOrError({ name: 'example' }).catch(err => {
        expect(err.name).to.equal('DocumentNotFoundError')
      })
    })
    it('statics findOneOrError Callback', function(done) {
      Example1.findOneOrError({ name: 'example' }, (err, doc) => {
        expect(err.name).to.equal('DocumentNotFoundError')
        done()
      })
    })
    it('statics findByIdOrError Promise', function() {
      return Example1.findByIdOrError('111f00000000000000000001').catch(err => {
        expect(err.name).to.equal('DocumentNotFoundError')
      })
    })
    it('statics findByIdOrError Callback', function(done) {
      Example1.findByIdOrError('111f00000000000000000001', (err, doc) => {
        expect(err.name).to.equal('DocumentNotFoundError')
        done()
      })
    })

    it('query findOne Promise (Query Helpers .throwEmpty())', function() {
      return Example1.findOne({ name: 'example' }).throwEmpty().catch(err => {
        expect(err.name).to.equal('DocumentNotFoundError')
      })
    })
    it('query findOne Promise (Set Option {emptyError: true})', function() {
      return Example1.findOne({ name: 'example' }, null, {emptyError: true}).catch(err => {
        expect(err.name).to.equal('DocumentNotFoundError')
      })
    })
    it('query findOne Callback (Set Option {emptyError: true})', function(done) {
      Example1.findOne({ name: 'example' }, null, {emptyError: true},function(err) {
        expect(err.name).to.equal('DocumentNotFoundError')
        done()
      })
    })

    it('query findById Promise (Query Helpers .throwEmpty())', function() {
      return Example1.findById('111f00000000000000000001').throwEmpty().catch(err => {
        expect(err.name).to.equal('DocumentNotFoundError')
      })
    })
    it('query findById Promise (Set Option {emptyError: true})', function() {
      return Example1.findById('111f00000000000000000001', null, {emptyError: true}).catch(err => {
        expect(err.name).to.equal('DocumentNotFoundError')
      })
    })

    it('query findById Callback (Set Option {emptyError: true})', function(done) {
      Example1.findById('111f00000000000000000001', null, {emptyError: true},function(err) {
        expect(err.name).to.equal('DocumentNotFoundError')
        done()
      })
    })

    it('statics findOneOrError Promise Set Error Code', function() {
      return Example1.findOneOrError({ name: 'example' }, null, { emptyError: 404 }).catch(err => {
        expect(err.code).to.equal(404)
      })
    })
    it('statics findOneOrError Callback Set Error Code', function(done) {
      Example1.findOneOrError({ name: 'example' }, null, { emptyError: 404 },(err, doc) => {
        expect(err.code).to.equal(404)
        done()
      })
    })

    it('query findOne Promise Set Error Code (Query Helpers .throwEmpty(404))', function() {
      return Example1.findOne({ name: 'example' }).throwEmpty(404).catch(err => {
        expect(err.code).to.equal(404)
      })
    })
    it('query findOne Promise Set Error Code (Set Option {emptyError: 404})', function() {
      return Example1.findOne({ name: 'example' }, null, {emptyError: 404}).catch(err => {
        expect(err.code).to.equal(404)
      })
    })
    it('query findOne Callback Set Error Code (Set Option {emptyError: 404})', function(done) {
      Example1.findOne({ name: 'example' }, null, {emptyError: 404},function(err) {
        expect(err.code).to.equal(404)
        done()
      })
    })
  })

  describe('FindOrErrorPlugin Custom Error Handle', function () {
    before(function () {
      return Example2.create([
        { name: 'example 1' },
        { name: 'example 2' }
      ])
    })
    it('statics findOneOrError Promise', function() {
      return Example2.findOneOrError({ name: 'example' }).catch(err => {
        expect(err.name).to.equal('NotFoundError')
      })
    })
  })

  describe('FindOrErrorPlugin Disable Statics findOneOrError', function () {
    before(function () {
      return Example3.create([
        { name: 'example 1' },
        { name: 'example 2' }
      ])
    })
    it('statics findOneOrError not exist', function(done) {
      try {
        Example3.findOneOrError({ name: 'example' }, done)
      } catch (err) {
        expect(err).to.be.exist
        done()
      }
    })
  })
})
