/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-16 13:10:57
 */

'use strict';

var Pagination = require('nd-pagination');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  host.on('change:gridData', function(gridData) {
    var params = host.get('params');

    if (plugin.exports) {
      plugin.exports.destroy();
    }

    plugin.exports = new Pagination({
      theme: 'floating',
      offset: params.offset,
      limit: params.limit,
      count: gridData.count,
      parentNode: host.$('[data-role="footer"]')
    }).on('goto', function(page) {
      host.getList({
        offset: (page - 1) * params.limit
      });
    }).render();
  });

  // 通知就绪
  this.ready();
};
