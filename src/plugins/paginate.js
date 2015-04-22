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

    var mode = host.get('mode');

    if (mode) {
      if (params.size >= gridData.count) {
        return;
      }
    } else {
      if (params.$limit >= gridData.count) {
        return;
      }
    }

    plugin.exports = new Pagination($.extend(true, {
      theme: 'floating',
      $offset: mode ? (params.page * params.size) : params.$offset,
      $limit: mode ? params.size : params.$limit,
      count: gridData.count,
      parentNode: host.$('[data-role="footer"]')
    }, options)).on('goto', function(page) {
      host.getList({
        data: mode ? {
          page: page - 1
        } : {
          $offset: (page - 1) * params.$limit
        }
      });
    }).render();
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  // 通知就绪
  this.ready();
};
