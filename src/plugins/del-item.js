/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var Confirm = require('nd-confirm');
var debug = require('nd-debug');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    awaiting;

  function delegate(e) {
    if (awaiting) {
      return;
    }

    Confirm.show(e.currentTarget.getAttribute('data-tips'), function() {
      // 添加用于阻止多次点击
      awaiting = true;

      plugin.trigger('submit', host.getItemIdByTarget(e.currentTarget), function() {
        awaiting = false;
      });
    });
  }

  (function(button) {
    host.addItemAction($.extend({
      'role': 'del-item',
      'text': '删除',
      'tips': '确定删除？'
    }, button), button && button.index, delegate);
  })(plugin.getOptions('button'));

  plugin.on('submit', function(id, done) {
    host.DELETE(id)
      .done(function(/*data*/) {
        host.deleteItem(id);
      })
      .fail(function(error) {
        debug.error(error);
      })
      .always(done);
    });

  // 通知就绪
  this.ready();
};
