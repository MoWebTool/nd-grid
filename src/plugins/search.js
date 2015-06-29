/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-06 16:09:55
 */

'use strict';

var $ = require('jquery');

var FormExtra = require('nd-form-extra');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

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
      }, plugin.getOptions('view')))
      .on('formSubmit', function() {
        this.submit(function(data) {
          plugin.trigger('submit', data);
        });
        // 阻止默认事件发生
        return false;
      }).render();

    plugin.on('submit', function(data) {
      data || (data = {});

      // 重置为第一页
      switch (host.get('mode')) {
        case 2:
          break;
        case 1:
          data.page = 0;
          break;
        default:
          data.$offset = 0;
      }

      host.getList({
        data: data
      });
    });

    // 刷新参数，重置表单
    host.on('change:params', function(params) {
      var form = plugin.exports;
      var fields = form.get('fields');

      params = form.get('inFilter').call(form, $.extend({}, params));

      $.each(fields, function(i, item) {
        var name = item.name,
          value = params && (name in params) ? params[name] : item.value;

        // BUG #6578
        // http://pms.sdp.nd/index.php?m=bug&f=view&ID=6578
        // add blur()
        form.getField(name).val(value).blur();
      });
    });

  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  // 通知就绪
  this.ready();
};
