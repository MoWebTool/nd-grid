/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')

var SORT_ASC = 'asc'
var SORT_DESC = 'desc'

module.exports = function() {
  var plugin = this
  var host = plugin.host

  var name
  var sort

  host.delegateEvents({

    'click [data-sort]': function(e) {
      name = e.target.getAttribute('data-name')
      sort = e.target.getAttribute('data-sort') === SORT_ASC ? SORT_DESC : SORT_ASC

      host.getList({
        // 重置为第一页
        data: $.extend({
          $orderby: [name, sort].join(' ')
        }, host.get('initialParams'))
      })
    }

  })

  host.after('renderPartial', function() {
    name && sort &&
      this.$('[data-sort][data-name="' + name + '"]')
      .attr('data-sort', sort)
  })

  // 通知就绪
  this.ready()
}
