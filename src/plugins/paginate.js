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

  host.on('change:gridData', function(gridData) {
    if (plugin.exports) {
      plugin.exports.destroy()
    }

    var theme = 'floating'
    var isLastPage = null

    var params = host.get('params')

    if (gridData.count) {
      if (params.$limit >= gridData.count) {
        return
      }
    } else {
      isLastPage = gridData.items === null || gridData.items.length < params.$limit
      if (isLastPage && params.$offset === 0) {
        return
      }
      theme = 'none'
    }

    plugin.exports = new Pagination($.extend({
      theme: theme,
      count: gridData.count,
      isLastPage: isLastPage,
      parentNode: host.$('[data-role="footer"]')
    }, params, viewOption)).on('goto', function(page) {
      host.getList({
        data: {
          $offset: params.$limit * (page - 1)
        }
      })
    }).render()
  })

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy()
  })

  // 通知就绪
  this.ready()
}
