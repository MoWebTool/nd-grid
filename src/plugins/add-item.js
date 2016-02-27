/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('nd-jquery');

var __ = require('nd-i18n');
var debug = require('nd-debug');
var FormExtra = require('nd-form-extra');

var uid = 0;

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    uniqueId = '0',
    awaiting;

  var SUB_ACTION = 'add';
  var FORM_METHOD = 'POST';

  function resetAwaiting() {
    awaiting = false;
  }

  function makeForm() {
    return new FormExtra($.extend(true, {
        name: 'grid-' + SUB_ACTION + '-item-' + (++uid),
        method: FORM_METHOD,
        parentNode: host.get('parentNode')
      }, plugin.getOptions('view')))
      .on('formCancel', function() {
        plugin.trigger('hide', this);
      })
      .on('formSubmit', function(data) {
        plugin.trigger('submit', data, resetAwaiting);
      });
  }

  /**
   * 获取数据
   */
  function startup() {
    // host.set('sub', {
    //   id: uniqueId,
    //   act: SUB_ACTION
    // });

    if (!plugin.exports) {
      plugin.exports = makeForm().render();
    }

    plugin.trigger('show', plugin.exports);
  }

  // 插入按钮，并绑定事件代理
  host.addGridAction($.extend({
    role: SUB_ACTION + '-item',
    text: __('新增')
  }, plugin.getOptions('button')), startup);

  // 渲染完成后，检查二级路由并发起请求
  host.after('renderPartial', function() {
    function valid(sub) {
      return sub && sub.act === SUB_ACTION && sub.id === uniqueId && !sub.instance;
    }

    function change(sub) {
      if (valid(sub)) {
        startup();
      }
    }

    change(host.get('sub'));

    host.on('change:sub', change);
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  plugin.on('show', function(form) {
    if (!plugin.getOptions('interact')) {
      host.element.hide();
    }

    host.set('sub', {
      instance: form
    });

    form.element.show();
  });

  plugin.on('hide', function(form) {
    if (!plugin.getOptions('interact')) {
      host.element.show();
    }

    host.set('sub', null);

    form && form.destroy();
    delete plugin.exports;
  });

  plugin.on('submit', function(data, done) {
    if (awaiting) {
      return;
    }

    // 添加用于阻止多次点击
    awaiting = true;

    var actionPost = plugin.getOptions(FORM_METHOD) ||
      function(data) {
        return host[plugin.exports.get('method')]({data: data});
      };

    actionPost(data)
    .then(function( /*data*/ ) {
      // 成功，返回第一页
      host.getList({
        data: host.get('initialParams')
      });

      // 隐藏
      plugin.trigger('hide', plugin.exports);
    })
    .catch(function(error) {
      debug.error(error);
    })
    .finally(done);
  });

  // 通知就绪
  this.ready();
};
