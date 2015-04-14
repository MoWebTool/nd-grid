/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var FormExtra = require('nd-form-extra');

var helpers = require('../helpers');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {};

  function makeForm() {
    return new FormExtra($.extend(true, {
      name: 'grid-add-item',
      // action: '',
      method: 'POST',

      parentNode: host.get('parentNode')
    }, options))
    .on('formCancel', function() {
      plugin.trigger('hide', this);
    })
    .on('formSubmit', function() {
      var that = this;
      // 调用队列
      this.queue.run(function() {
        plugin.trigger('submit', that.get('dataParser').call(that));
      });
      // 阻止默认事件发生
      return false;
    });
  }

  (function() {
    // 添加按钮到顶部
    host.$(helpers.makePlace(options.button)).append(
      helpers.makeButton($.extend({
        'role': 'add-item',
        'text': '新增'
      }, options.button))
    );

    // 移除参数
    delete options.button;
  })();

  host.delegateEvents({
    'click [data-role="add-item"]': function() {
      if (!plugin.exports) {
        plugin.exports = makeForm().render();
        // plugin.trigger('export', plugin.exports);
      }

      plugin.trigger('show', plugin.exports);
    }
  });

  plugin.on('show', function(form) {
    // 通知就绪
    // plugin.ready();

    host.element.hide();
    form.element.show();
  });

  plugin.on('hide', function(form) {
    host.element.show();
    form.destroy();
    delete plugin.exports;
  });

  plugin.on('submit', function(data) {
    host.POST(data)
      .done(function(/*data*/) {
        // 成功，返回第一页
        host.getList({
          $offset: 0
        });

        // 隐藏
        plugin.trigger('hide', plugin.exports);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  });

  // 通知就绪
  this.ready();
};
