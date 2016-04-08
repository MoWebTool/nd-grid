/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')

module.exports = function() {
  var plugin = this,
    host = plugin.host

  host.addGridAction($.extend({
    role: 'history-back',
    text: '返回'
  }, plugin.getOptions('button')), function() {
    host.trigger('hide')
  })

  // 通知就绪
  this.ready()
}
