/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var debug = require('nd-debug');
var FormExtra = require('nd-form-extra');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    awaiting;

  function makeForm() {
    return new FormExtra($.extend(true, {
        name: 'grid-add-item',
        method: 'POST',
        proxy: host.get('proxy'),
        parentNode: host.get('parentNode')
      }, plugin.getOptions('view')))
      .on('formCancel', function() {
        plugin.trigger('hide', this);
      })
      .on('formSubmit', function() {
        // 调用队列
        this.submit(function(data) {
          plugin.trigger('submit', data, function() {
            awaiting = false;
          });
        });
        // 阻止默认事件发生
        return false;
      });
  }

  host.addGridAction($.extend({
    role: 'add-item',
    text: '新增'
  }, plugin.getOptions('button')), function() {
    if (!plugin.exports) {
      plugin.exports = makeForm().render();
    }

    plugin.trigger('show', plugin.exports);
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  plugin.on('show', function(form) {
    if (!this.getOptions('interact')) {
      host.element.hide();
    }

    form.element.show();
  });

  plugin.on('hide', function(form) {
    if (!this.getOptions('interact')) {
      host.element.show();
    }

    form.destroy();
    delete plugin.exports;
  });

  plugin.on('submit', function(data, done) {
    if (awaiting) {
      return;
    }

    // 添加用于阻止多次点击
    awaiting = true;

    host[plugin.exports.get('method')]({
        data: data
      })
      .done(function( /*data*/ ) {
        // 成功，返回第一页
        host.getList({
          data: (function(mode) {
            switch (mode) {
              case 2:
                return {};
              case 1:
                return {
                  page: 0
                };
              default:
                return {
                  $offset: 0
                };
            }
          })(host.get('mode'))
        });

        // 隐藏
        plugin.trigger('hide', plugin.exports);
      })
      .fail(function(error) {
        debug.error(error);
      })
      .always(done);
  });

  // 通知就绪
  this.ready();
};
