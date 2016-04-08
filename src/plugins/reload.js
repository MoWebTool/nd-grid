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
    role: 'reload',
    text: '刷新'
  }, plugin.getOptions('button')), function() {
    host.getList()
  })

  host.after('renderPartial', function() {
    host.$('[data-role="reload"]').prop('disabled', false)
  })

  // 通知就绪
  this.ready()
}
