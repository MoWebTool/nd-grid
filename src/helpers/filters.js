'use strict'

var datetime = require('nd-datetime')
var debug = require('nd-debug')

module.exports = {

  datetime: function(value) {
    return value ? datetime(value).format() : '-'
  },

  json: function(value) {
    if (!value || typeof value === 'string') {
      return value
    }

    try {
      return JSON.stringify(value, null, 4).replace(/\n/g, '\r')
    } catch(e) {
      debug.log(e)
    }

    return value
  },

  html: function(value) {
    return {
      safe: true,
      html: value
    }
  }

}
