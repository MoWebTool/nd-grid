/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')

var SORT_ASC = 'asc'
var SORT_DESC = 'desc'

module.exports = function() {
  var plugin = this,
    host = plugin.host

  var key
  var sort

  host.delegateEvents({

    'click [data-sort]': function(e) {
      key = e.target.getAttribute('data-key')
      sort = e.target.getAttribute('data-sort')

      sort = sort === SORT_ASC ? SORT_DESC : SORT_ASC

      host.getList({
        // 重置为第一页
        data: $.extend({
          $orderby: [key, sort].join(' ')
        }, host.get('initialParams'))
      })
    }

  })

  host.after('renderPartial', function() {
    key && sort &&
      this.$('[data-sort][data-key="' + key + '"]')
      .attr('data-sort', sort)
  })

  // 通知就绪
  this.ready()
}
