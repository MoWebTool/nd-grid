/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  host.delegateEvents({

    'click [data-key]': function(e) {
      var sortable = this.get('sortable');
      var key = e.target.getAttribute('data-key');
      // var order = e.target.getAttribute('data-order') || 'desc';
      if (typeof sortable === 'boolean' || $.inArray(key, sortable) !== -1) {
        var data = {};

        // TODO: add arrows

        // 重置为第一页
        data.$orderby = key;
        // data.$order = order;

        host.getList({
          data: data
        });
      }
    }

  });

  // 通知就绪
  this.ready();
};
