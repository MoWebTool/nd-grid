/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')

var debug = require('nd-debug')
var FormExtra = require('nd-form-extra')

var fetch = require('../helpers/fetch')
// var Edit = require('../modules/inline/edit')

var uid = 0

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    uniqueId,
    awaiting

  var SUB_ACTION = 'dup'
  var FORM_METHOD = 'POST'

  var viewOptions = plugin.getOptions('view')
  var interact = plugin.getOptions('interact')
  // var isInline = interact && interact.type === 'inline'
  var columns = host.getEditableColumns()

  function resetAwaiting() {
    awaiting = false
  }

  /**
   * 生成表单
   */
  function makeForm(data) {
    // var Cls = (isInline && item) ? Edit : FormExtra

    return new FormExtra($.extend({
      name: 'grid-' + SUB_ACTION + '-item-' + (++uid),
      method: FORM_METHOD,
      parentNode: host.get('parentNode'),
      fields: columns,
      host: host
    }, viewOptions, {
      formData: data
    })).on('formCancel', function() {
      plugin.trigger('hide', this)
    }).on('formSubmit', function(data) {
      debugger
      plugin.trigger('submit', data, resetAwaiting)
    })
  }

  /**
   * 获取数据
   */
  function startup() {
    fetch(plugin)(uniqueId)
      .then(function(data) {
        plugin.exports = makeForm(data).render()
        plugin.trigger('show', plugin.exports)
      })
      .catch(debug.error)
      .finally(resetAwaiting)
  }

  // 插入按钮，并绑定事件代理
  (function(button) {
    host.addItemAction($.extend({
      'role': SUB_ACTION + '-item',
      'text': '复制'
    }, button), button && button.index || 0, function(e) {
      if (awaiting) {
        return
      }

      if (plugin.exports) {
        plugin.trigger('hide', plugin.exports)
      }
      // 添加用于阻止多次点击
      awaiting = true
      uniqueId = host.getItemIdByTarget(e.currentTarget)
      startup(/*(uniqueId = host.getItemIdByTarget(e.currentTarget)), host.getItemByTarget(e.currentTarget)*/)
    })
  })(plugin.getOptions('button'))

  // // 异步插件，需要刷新列表
  if (plugin._async) {
    host._renderPartial()
  }

  // 渲染完成后，检查二级路由并发起请求
  host.after('renderPartial', function() {
    if (awaiting) {
      return
    }

    function valid(sub) {
      return sub && sub.act === SUB_ACTION && sub.id && sub.id !== '0' && !sub.instance
    }

    function change(sub) {
      if (valid(sub)) {
        awaiting = true
        uniqueId = sub.id
        startup()
      }
    }

    change(host.get('sub'))

    host.on('change:sub', change)
  })

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy()
  })

  plugin.on('show', function(form) {
    if (!interact) {
      host.element.hide()
    }

    host.set('sub', {
      instance: form
    })

    form.show ? form.show() : form.element.show()
  })

  plugin.on('hide', function(form) {
    if (!interact) {
      host.element.show()
    }

    host.set('sub', null)

    form && form.destroy()
    delete plugin.exports
  })

  plugin.on('submit', function(data, done) {
    if (awaiting) {
      return
    }

    // 添加用于阻止多次点击
    awaiting = true

    var action = plugin.getOptions(FORM_METHOD) ||
      function(data) {
        return host[plugin.exports.get('method')]({data: data})
      }

    action(data)
      .then(function( /*data*/ ) {
        // 成功，刷新当前页
        host.getList()

        plugin.trigger('hide', plugin.exports)
      })
      .catch(debug.error)
      .finally(done)
  })

  // 通知就绪
  this.ready()
}
