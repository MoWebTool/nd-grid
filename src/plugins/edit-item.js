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
    uniqueId,
    awaiting;

  function makeForm(data) {
    return new FormExtra($.extend(true, {
      name: 'grid-edit-item',
      method: 'PATCH',
      proxy: host.get('proxy'),
      parentNode: host.get('parentNode')
    }, plugin.getOptions('view'), { formData: data }))
    .on('formCancel', function() {
      plugin.trigger('hide', this);
    })
    .on('formSubmit', function() {
      this.submit(function(data) {
        plugin.trigger('submit', data, function() {
          awaiting = false;
        });
      });
      // 阻止默认事件发生
      return false;
    });
  }

  function delegate(e) {
    if (awaiting) {
      return;
    }

    if (!plugin.exports) {
      // 添加用于阻止多次点击
      awaiting = true;

      uniqueId = host.getItemIdByTarget(e.currentTarget);

      var actionFetch = plugin.getOptions('GET') || function(uniqueId) {
        return host.GET(uniqueId);
      };

      if (actionFetch === 'LOCAL') {
        actionFetch = function(uniqueId) {
          var defer = $.Deferred();
          defer.resolve(host.getItemDataById(uniqueId, true));
          return defer.promise();
        };
      }

      actionFetch(uniqueId)
      .done(function(data) {
        plugin.exports = makeForm(data).render();
        plugin.trigger('show', plugin.exports);
      })
      .fail(function(error) {
        debug.error(error);
      })
      .always(function() {
        awaiting = false;
      });
    } else {
      plugin.trigger('show', plugin.exports);
    }
  }

  (function(button) {
    host.addItemAction($.extend({
      'role': 'edit-item',
      'text': '编辑'
    }, button), button && button.index || 0, delegate);
  })(plugin.getOptions('button'));

  // 异步插件，需要刷新列表
  if (plugin._async) {
    host._renderPartial();
  }

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

    var actionPatch = plugin.getOptions('PATCH') || function(uniqueId, data) {
      return host[plugin.exports.get('method')](uniqueId, data);
    };

    actionPatch(uniqueId, data)
    .done(function(/*data*/) {
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
