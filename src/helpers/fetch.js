'use strict'

var Promise = require('nd-promise')

module.exports = function(plugin) {
  var actionFetch = plugin.getOptions('GET') ||
    function(uniqueId) {
      return plugin.host.GET(uniqueId)
    }

  // 从本地（GRID）获取数据
  if (actionFetch === 'LOCAL') {
    actionFetch = function(uniqueId) {
      return Promise.resolve(plugin.host.getItemDataById(uniqueId, true))
    }
  }

  return actionFetch
}
