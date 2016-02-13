/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var __ = require('nd-i18n');
var debug = require('nd-debug');
var FormExtra = require('nd-form-extra');

var uid = 0;

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    uniqueId,
    awaiting;

  var SUB_ACTION = 'edit';
  var FORM_METHOD = 'PATCH';

  function resetAwaiting() {
    awaiting = false;
  }

  /**
   * 生成表单
   */
  function makeForm(data) {
    return new FormExtra($.extend(true, {
        name: 'grid-' + SUB_ACTION + '-item-' + (++uid),
        method: FORM_METHOD,
        parentNode: host.get('parentNode')
      }, plugin.getOptions('view'), {
        formData: data
      }))
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
  function startup(id, done) {
    var actionFetch = plugin.getOptions('GET') ||
      function(uniqueId) {
        return host.GET(uniqueId);
      };

    // 从本地（GRID）获取数据
    if (actionFetch === 'LOCAL') {
      actionFetch = function(uniqueId) {
        var defer = $.Deferred();
        defer.resolve(host.getItemDataById(uniqueId, true));
        return defer.promise();
      };
    }

    plugin.exports && plugin.exports.destroy();

    actionFetch(uniqueId)
      .done(function(data) {
        plugin.exports = makeForm(data).render();
        plugin.trigger('show', plugin.exports);
      })
      .fail(function(error) {
        debug.error(error);
      })
      .always(done || resetAwaiting);
  }

  // 插入按钮，并绑定事件代理
  (function(button) {
    host.addItemAction($.extend({
      'role': SUB_ACTION + '-item',
      'text': __('编辑')
    }, button), button && button.index || 0, function(e) {
      if (awaiting) {
        return;
      }

      if (!plugin.exports) {
        // 添加用于阻止多次点击
        awaiting = true;
        startup((uniqueId = host.getItemIdByTarget(e.currentTarget)));
      } else {
        plugin.trigger('show', plugin.exports);
      }
    });
  })(plugin.getOptions('button'));

  // 异步插件，需要刷新列表
  if (plugin._async) {
    host._renderPartial();
  }

  // 渲染完成后，检查二级路由并发起请求
  host.after('renderPartial', function() {
    if (awaiting) {
      return;
    }

    function change(sub) {
      if (sub && sub.act === SUB_ACTION) {
        awaiting = true;
        startup((uniqueId = sub.id));
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

    // DEPRECATED. 将在下一版本移除
    host.set('activePlugin', plugin);

    host.set('sub', {
      id: uniqueId,
      act: SUB_ACTION
    }, {
      override: true,
      silent: true
    });

    form.element.show();
  });

  plugin.on('hide', function(form) {
    if (!plugin.getOptions('interact')) {
      host.element.show();
    }

    // DEPRECATED. 将在下一版本移除
    host.set('activePlugin', null);

    host.set('sub', null, {
      override: true,
      silent: true
    });

    form && form.destroy();
    delete plugin.exports;
  });

  plugin.on('submit', function(data, done) {
    if (awaiting) {
      return;
    }

    // 添加用于阻止多次点击
    awaiting = true;

    var action = plugin.getOptions(FORM_METHOD) ||
      function(uniqueId, data) {
        return host[plugin.exports.get('method')](uniqueId, data);
      };

    action(uniqueId, data)
      .done(function( /*data*/ ) {
        // 成功，刷新当前页
        host.getList();

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
