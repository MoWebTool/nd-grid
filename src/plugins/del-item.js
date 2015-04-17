/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Confirm = require('nd-confirm');
var Alert = require('nd-alert');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {},
    awaiting;

  host.addItemAction($.extend({
    'role': 'del-item',
    'text': '删除'
  }, options.button));

  host.delegateEvents({

    'click [data-role="del-item"]': function(e) {
      Confirm.show('确定删除？', function() {
        var id = host.getItemIdByTarget(e.currentTarget);

        if (awaiting) {
          return;
        }

        // 添加用于阻止多次点击
        awaiting = true;

        host.DELETE(id)
          .done(function(/*data*/) {
            host.deleteItem(id);
          })
          .fail(function(error) {
            Alert.show(error);
          })
          .always(function() {
            awaiting = false;
          });

      });
    }

  });

  // 通知就绪
  this.ready();
};
