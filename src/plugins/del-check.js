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
    host = plugin.host;

  var delItem = function(id) {
    host.DELETE(id)
      .done(function(/*data*/) {
        host.$('[data-id="' + id + '"]').remove();

        if (host.$('[data-role=item]').length === 0) {
          host.reloadList();
        }
      })
      .fail(function(error) {
        Alert.show(error);
      });
  };

  // helpers

  function getChecked() {
    return host.$('[name=check-item]:checked');
  }

  function getDelCheck() {
    return host.$('[data-role=del-check]');
  }

  host.get('gridActions').unshift({
    'role': 'del-check',
    'text': '删除选定',
    'disabled': true
  });

  host.delegateEvents({

    // 全选
    'change [data-role=check-all]': function(e) {
      getDelCheck().prop('disabled', !e.currentTarget.checked);
    },

    // 选中行
    'change [name=check-item]': function(e) {
      if (e.currentTarget.checked) {
        getDelCheck().prop('disabled', false);
      } else {
        getDelCheck().prop('disabled', !getChecked().length);
      }
    },

    'click [data-role=del-check]': function() {

      Confirm.show('确定删除选定？', function() {
        // TODO: batch delete
        $.each(getChecked(), function(i, item) {
          delItem(item.value);
        });
      });
    }

  });

  // 通知就绪
  this.ready();
};
