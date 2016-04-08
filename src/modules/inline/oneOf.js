'use strict'

module.exports = function(type, types, options) {
  return types.split(',').indexOf(type || 'text') !== -1 ?
    options.fn(this) : options.inverse(this)
}
