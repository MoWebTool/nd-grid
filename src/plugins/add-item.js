/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var FormExtra = require('nd-form-extra');

var helpers = require('../helpers');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    awaiting;

  function makeForm() {
    return new FormExtra($.extend(true, {
      name: 'grid-add-item',
      // action: '',
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

  // 添加按钮到顶部
  (function(button) {
    host.$(helpers.makePlace(button)).append(
      helpers.makeButton($.extend({
        role: 'add-item',
        text: '新增'
      }, button))
    );
  })(plugin.getOptions('button'));

  // 按钮事件
  host.delegateEvents({
    'click [data-role="add-item"]': function() {
      if (!plugin.exports) {
        plugin.exports = makeForm().render();
      }

      plugin.trigger('show', plugin.exports);
    }
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
      .done(function(/*data*/) {
        // 成功，返回第一页
        host.getList({
          data: host.get('mode') ? {
            page: 0
          } : {
            $offset: 0
          }
        });

        // 隐藏
        plugin.trigger('hide', plugin.exports);
      })
      .fail(function(error) {
        Alert.show(error);
      })
      .always(done);
  });

  // 通知就绪
  this.ready();
};
