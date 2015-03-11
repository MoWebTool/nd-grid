/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var Confirm = require('nd-confirm');
var Alert = require('nd-alert');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  // helpers

  function getItem(target) {
    return host.$(target).closest('[data-role=item]');
  }

  function getItemId(target) {
    return getItem(target).data('id');
  }

  host.get('itemActions').push({
    'role': 'del-item',
    'text': '删除'
  });

  host.delegateEvents({

    'click [data-role=del-item]': function(e) {

      Confirm.show('确定删除？', function() {

        var id = getItemId(e.currentTarget);

        host.DELETE(id)
          .done(function(/*data*/) {
            host.$('[data-id="' + id + '"]').remove();

            if (host.$('[data-role=item]').length === 0) {
              host.getList();
            }
          })
          .fail(function(error) {
            Alert.show(error);
          });

      });
    }

  });

  // 通知就绪
  this.ready();
};
