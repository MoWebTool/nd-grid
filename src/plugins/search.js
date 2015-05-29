/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-06 16:09:55
 */

'use strict';

var $ = require('jquery');

var FormExtra = require('nd-form-extra');
var Alert = require('nd-alert');

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
        pluginCfg: {
          // alias: Valiator.listeners.[start, starter, ready]
          Validator: [function() {
            this.setOptions('config', {
              triggerType: 'submit',
              showMessage: function(message, element) {
                Alert.show(message, function() {
                  element.focus();
                });
              },
              hideMessage: function( /*message, element*/ ) {
                Alert.hide();
              }
            });
          }]
        },
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
      if (host.get('mode')) {
        data.page = 0;
      } else {
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

        form.$('[name="' + name + '"]').val(value);
      });
    });

  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  // 通知就绪
  this.ready();
};
