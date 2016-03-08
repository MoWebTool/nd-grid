/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')

var __ = require('nd-i18n')
var debug = require('nd-debug')
var Confirm = require('nd-confirm')

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    awaiting

  function delegate(e) {
    if (awaiting) {
      return
    }

    Confirm.show(e.currentTarget.getAttribute('data-tips'), function() {
      // 添加用于阻止多次点击
      awaiting = true

      plugin.trigger('submit', host.getItemIdByTarget(e.currentTarget), function() {
        awaiting = false
      })
    })
  }

  (function(button) {
    host.addItemAction($.extend({
      'role': 'del-item',
      'text': __('删除'),
      'tips': __('确定删除？')
    }, button), button && button.index, delegate)
  })(plugin.getOptions('button'))

  plugin.on('submit', function(id, done) {

    var actionDelete = plugin.getOptions('DELETE') || function(id) {
      return host.DELETE(id)
    }

    actionDelete(id)
    .then(function(/*data*/) {
      host.deleteItem(id)
    })
    .catch(function(error) {
      debug.error(error)
    })
    .finally(done)
  })

  // 通知就绪
  this.ready()
}
