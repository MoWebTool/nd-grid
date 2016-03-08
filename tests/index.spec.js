'use strict'

// var $ = require('nd-jquery')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var Grid = require('../index')

var expect = chai.expect
// var sinon = window.sinon

chai.use(sinonChai)

/*globals describe,it*/

describe('Grid', function() {

  it('function', function() {
    expect(Grid).to.be.a('function')
  })

  it('new Grid', function() {
    expect(new Grid).to.have.property('getList')
  })

})
