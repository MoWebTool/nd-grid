/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var FormExtra = require('nd-form-extra');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    uniqueId,
    awaiting;

  function makeForm(data) {
    return new FormExtra($.extend(true, {
      name: 'grid-edit-item',
      // action: '',
      method: 'PATCH',
      // 表单数据
      formData: data,
      proxy: host.get('proxy'),
      parentNode: host.get('parentNode')
    }, plugin.getOptions('view')))
    .on('formCancel', function() {
      plugin.trigger('hide', this);
    })
    .on('formSubmit', function() {
      this.submit(function(data) {
        plugin.trigger('submit', data);
      });
      // 阻止默认事件发生
      return false;
    });
  }

  (function(button) {
    host.addItemAction($.extend({
      'role': 'edit-item',
      'text': '编辑'
    }, button), button && button.index || 0);
  })(plugin.getOptions('button'));

  // 异步插件，需要刷新列表
  if (plugin._async) {
    host._renderPartial();
  }

  host.delegateEvents({
    'click [data-role="edit-item"]': function(e) {
      if (awaiting) {
        return;
      }

      if (!plugin.exports) {
        // 添加用于阻止多次点击
        awaiting = true;

        uniqueId = host.getItemIdByTarget(e.currentTarget);

        var detail = plugin.getOptions('detail');
        if (detail && detail.useLocal) {
          plugin.exports = makeForm(host.getItemDataById(uniqueId, true)).render();
          plugin.trigger('show', plugin.exports);
          awaiting = false;
          return;
        }

        host.GET(uniqueId)
        .done(function(data) {
          plugin.exports = makeForm(data).render();
          plugin.trigger('show', plugin.exports);
        })
        .fail(function(error) {
          Alert.show(error);
        })
        .always(function() {
          awaiting = false;
        });
      } else {
        plugin.trigger('show', plugin.exports);
      }
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

  plugin.on('submit', function(data) {
    if (awaiting) {
      return;
    }

    // 添加用于阻止多次点击
    awaiting = true;

    host[plugin.exports.get('method')](uniqueId, data)
      .done(function(/*data*/) {
        // 成功，刷新当前页
        host.getList();

        plugin.trigger('hide', plugin.exports);
      })
      .fail(function(error) {
        Alert.show(error);
      })
      .always(function() {
        awaiting = false;
      });
  });

  // 通知就绪
  this.ready();
};
