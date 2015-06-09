/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-16 13:10:57
 */

'use strict';

var $ = require('jquery');

var Pagination = require('nd-pagination');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var viewOption = plugin.getOptions('view');

  if (viewOption && viewOption.theme === 'none') {
    host.on('change:gridData', function(gridData) {
      if (plugin.exports) {
        plugin.exports.destroy();
      }

      var params = host.get('params');

      // 0: mysql or 1: mongodb or 2: no pagination
      var mode = host.get('mode');

      var _params = (function(mode) {
        switch (mode) {
          case 2:
            return {};
          case 1:
            return {
              $offset: params.page * params.size,
              $limit: params.size
            };
          default:
            return {
              $offset: params.$offset,
              $limit: params.$limit
            };
        }
      })(mode);

      plugin.exports = new Pagination($.extend({
        parentNode: host.$('[data-role="footer"]'),
        isLastPage: gridData.items === null
      }, _params, viewOption)).on('goto', function(page) {
        host.getList({
          data: (function(mode) {
            switch (mode) {
              case 2:
                return {};
              case 1:
                return {
                  page: page - 1
                };
              default:
                return {
                  $offset: (page - 1) * params.$limit
                };
            }
          })(mode)
        });
      }).render();
    });
  } else {
    host.on('change:gridData', function(gridData) {
      if (plugin.exports) {
        plugin.exports.destroy();
      }

      if (!gridData.count) {
        return;
      }

      var params = host.get('params');

      // 0: mysql or 1: mongodb or 2: no pagination
      var mode = host.get('mode');

      if (gridData.count) {
        if (mode === 1) {
          if (params.size >= gridData.count) {
            return;
          }
        } else if (mode === 0) {
          if (params.$limit >= gridData.count) {
            return;
          }
        }
      }

      var _params = (function(mode) {
        switch (mode) {
          case 2:
            return {};
          case 1:
            return {
              $offset: params.page * params.size,
              $limit: params.size
            };
          default:
            return {
              $offset: params.$offset,
              $limit: params.$limit
            };
        }
      })(mode);

      plugin.exports = new Pagination($.extend({
        theme: 'floating',
        count: gridData.count,
        parentNode: host.$('[data-role="footer"]')
      }, _params, viewOption)).on('goto', function(page) {
        host.getList({
          data: (function(mode) {
            switch (mode) {
              case 2:
                return {};
              case 1:
                return {
                  page: page - 1
                };
              default:
                return {
                  $offset: (page - 1) * params.$limit
                };
            }
          })(mode)
        });
      }).render();
    });
  }

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  // 通知就绪
  this.ready();
};
