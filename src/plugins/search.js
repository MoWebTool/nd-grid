/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-06 16:09:55
 */

'use strict';

var $ = require('jquery');

var FormExtra = require('nd-form-extra');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {};

  host.after('render', function() {

    plugin.exports = new FormExtra($.extend(true, {
      name: 'grid-search',
      className: 'ui-form-search',
      buttons: [{
        label: '搜索',
        type: 'submit',
        role: 'form-submit'
      }],
      parentNode: host.element,
      insertInto: function(element, parentNode) {
        element.prependTo(parentNode);
      }
    }, options))
    .on('formSubmit', function() {
      var that = this;
      // 调用队列
      this.queue.run(function() {
        plugin.trigger('submit', that.get('dataParser').call(that));
      });
      // 阻止默认事件发生
      return false;
    }).render();

    plugin.on('submit', function(data) {
      data || (data = {});

      // 重置为第一页
      data.$offset = 0;

      host.getList(data);
    });

    // 刷新参数，重置表单
    host.on('change:params', function(params) {
      var fields = plugin.exports.get('fields');

      $.each(fields, function(i, item) {
        var name = item.name,
          value = params && (name in params) ? params[name] : item.value;

        plugin.exports.$('[name="' + name + '"]').val(value);
      });
    });

  });

  // 通知就绪
  this.ready();
};
