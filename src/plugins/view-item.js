/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var Alert = require('nd-alert');

module.exports = function(host) {
  var plugin = this;

  // helpers

  function getItem(target) {
    return host.$(target).closest('[data-role=item]');
  }

  function getItemId(target) {
    return getItem(target).data('id');
  }

  host.delegateEvents({
    'click [data-role=view-item]': function(e) {
      var id = getItemId(e.currentTarget);

      host.GET(id)
        .done(function(data) {
          plugin.trigger('show', id, data);
        })
        .fail(function(error) {
          Alert.show(error);
        });
    }
  });

  // 通知就绪
  this.ready();
};
