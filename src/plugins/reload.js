/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  host.get('pageActions').push({
    'role': 'reload',
    'text': '刷新'
  });

  host.delegateEvents({
    'click [data-role=reload]': function() {
      host.getList();
    }
  });

  // 通知就绪
  this.ready();
};
