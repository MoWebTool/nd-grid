/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var Confirm = require('nd-confirm');

var helpers = require('../helpers');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {},
    awaiting;

  var delItem = function(id, callback) {
    host.DELETE(id)
      .done(function(/*data*/) {
        host.deleteItem(id);

        getDelCheck().prop('disabled', !getChecked().length);
      })
      .fail(function(error) {
        Alert.show(error);
      })
      .always(callback);
  };

  // helpers

  function getChecked() {
    return host.$('[name="check-item"]:checked');
  }

  function getDelCheck() {
    return host.$('[data-role="del-check"]');
  }

  (function() {
    // 添加按钮到顶部
    host.$(helpers.makePlace(options.button)).append(
      helpers.makeButton($.extend({
        'role': 'del-check',
        'text': '删除选定',
        'disabled': true
      }, options.button))
    );

    // 移除参数
    delete options.button;
  })();

  host.delegateEvents({

    // 全选
    'change [data-role="check-all"]': function(e) {
      getDelCheck().prop('disabled', !e.currentTarget.checked);
    },

    // 选中行
    'change [name="check-item"]': function(e) {
      if (e.currentTarget.checked) {
        getDelCheck().prop('disabled', false);
      } else {
        getDelCheck().prop('disabled', !getChecked().length);
      }
    },

    'click [data-role="del-check"]': function() {
      if (awaiting) {
        return;
      }

      Confirm.show('确定删除选定？', function() {
        awaiting = true;
        // TODO: batch delete?
        var items = getChecked();
        var count = items.length;
        var ready = 0;
        function cb() {
          if (++ready === count) {
            awaiting = false;
          }
        }
        $.each(items, function(i, item) {
          delItem(item.value, cb);
        });
      });
    }

  });

  host.on('change:itemList', function(/*itemList*/) {
    getDelCheck().prop('disabled', !getChecked().length);
  });

  // 通知就绪
  this.ready();
};
