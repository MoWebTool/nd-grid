/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')

var __ = require('nd-i18n')

var FormExtra = require('nd-form-extra')

var uid = 0

module.exports = function() {
  var plugin = this,
    host = plugin.host

  host.after('render', function() {

    plugin.exports = new FormExtra($.extend(true, {
      name: 'grid-search-' + (++uid),
      className: 'ui-form-search',
      buttons: [{
        label: __('搜索'),
        type: 'submit',
        role: 'form-submit'
      }],
      parentNode: host.element,
      insertInto: function(element, parentNode) {
        element.prependTo(parentNode)
      }
    }, plugin.getOptions('view')))
      .on('formSubmit', function(data) {
        plugin.trigger('submit', data)
      }).render()

    plugin.on('submit', function(data) {
      data || (data = {})

      host.getList({
        data: $.extend(data, host.get('initialParams'))
      })
    })

    // 刷新参数，重置表单
    host.on('change:params', function(params) {
      var form = plugin.exports
      var fields = form.get('fields')

      params = form.get('inFilter').call(form, $.extend({}, params))

      $.each(fields, function(i, item) {
        var name = item.name
        var value = item.value

        if (params && params.hasOwnProperty(name)) {
          value = params[name]
        }

        // BUG #6578
        // http://pms.sdp.nd/index.php?m=bug&f=view&ID=6578
        // add blur()
        if (typeof value !== 'undefined') {
          form.getField(name).val(value).blur()
        }
      })
    })

  })

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy()
  })

  // 通知就绪
  this.ready()
}
