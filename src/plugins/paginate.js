/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-16 13:10:57
 */

'use strict';

var $ = require('jquery');

var Pagination = require('nd-pagination');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {};

  host.on('change:gridData', function(gridData) {
    if (plugin.exports) {
      plugin.exports.destroy();
    }

    if (!gridData.count) {
      return;
    }

    var params = host.get('params');

    if (params.$limit >= gridData.count) {
      return;
    }

    plugin.exports = new Pagination($.extend(true, {
      theme: 'floating',
      $offset: params.$offset,
      $limit: params.$limit,
      count: gridData.count,
      parentNode: host.$('[data-role="footer"]')
    }, options)).on('goto', function(page) {
      host.getList({
        $offset: (page - 1) * params.$limit
      });
    }).render();
  });

  // 通知就绪
  this.ready();
};
