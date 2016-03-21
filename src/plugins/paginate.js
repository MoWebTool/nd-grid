/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')

var Pagination = require('nd-pagination')

module.exports = function() {
  var plugin = this,
    host = plugin.host

  var viewOption = plugin.getOptions('view')

  if (viewOption && viewOption.theme === 'none') {
    host.on('change:gridData', function(gridData) {
      if (plugin.exports) {
        plugin.exports.destroy()
      }

      var params = host.get('params')

      plugin.exports = new Pagination($.extend({
        parentNode: host.$('[data-role="footer"]'),
        //当 items.length 数不足分页阈值时，就可以预判当前为最后一页
        isLastPage: gridData.items === null || gridData.items.length < params.$limit
      }, params, viewOption)).on('goto', function(page) {
        host.getList({
          data: {
            $offset: params.$limit * (page - 1)
          }
        })
      }).render()
    })
  } else {
    host.on('change:gridData', function(gridData) {
      if (plugin.exports) {
        plugin.exports.destroy()
      }

      if (!gridData.count) {
        return
      }

      var params = host.get('params')

      if (gridData.count) {
        if (params.$limit >= gridData.count) {
          return
        }
      }

      plugin.exports = new Pagination($.extend({
        theme: 'floating',
        count: gridData.count,
        parentNode: host.$('[data-role="footer"]')
      }, params, viewOption)).on('goto', function(page) {
        host.getList({
          data: {
            $offset: params.$limit * (page - 1)
          }
        })
      }).render()
    })
  }

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy()
  })

  // 通知就绪
  this.ready()
}
