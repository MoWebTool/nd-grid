/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var __ = require('nd-i18n');
var debug = require('nd-debug');
var Confirm = require('nd-confirm');
var Queue = require('nd-queue');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    awaiting;

  var delItem = function(id, callback) {
    var actionDelete = plugin.getOptions('DELETE') || function(id) {
      return host.DELETE(id);
    };
    var doneCallback = plugin.getOptions('callback') || function(id) {
      host.deleteItem(id);
    };

    actionDelete(id)
    .done(function(data) {
      doneCallback(id, data);

      getDelCheck().prop('disabled', !getChecked().length);
    })
    .fail(function(error) {
      debug.error(error);
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

  host.addGridAction($.extend({
    role: 'del-check',
    text: __('删除选定'),
    tips: __('确定删除选定？'),
    disabled: true
  }, plugin.getOptions('button')), function(e) {
    if (awaiting) {
      return;
    }

    Confirm.show(e.currentTarget.getAttribute('data-tips'), function() {
      awaiting = true;

      plugin.trigger('submit', $.map(getChecked(), function(item) {
        return item.value;
      }), function() {
        awaiting = false;
      });
    });
  });

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
    }

  });

  plugin.on('submit', function(ids, done) {
    // batch delete
    if (plugin.getOptions('multiple')) {
      delItem(ids, done);
    } else {
      var queue = new Queue();

      ids.forEach(function(id) {
        queue.use(function(next) {
          delItem(id, next);
        });
      });

      queue.all(done);
    }
  });

  host.after('renderPartial', function() {
    getDelCheck().prop('disabled', !getChecked().length);
  });

  // 删除 item 后重新判断是否 disabled
  host.on('deleteItemDone', function() {
    getDelCheck().prop('disabled', !getChecked().length);
  });

  // 通知就绪
  this.ready();
};
