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

/**
 * DEPRECATED. 将在下一版本移除
 */
module.exports = function() {
  var plugin = this,
    host = plugin.host,
    uniqueId,
    awaiting;

  console.warn('不建议使用 put-item 插件，将在后续版本移除，请使用 edit-item。');

  function makeForm(data) {
    return new FormExtra($.extend(true, {
      name: 'grid-put-item-' + (++uid),
      method: 'PUT',
      parentNode: host.get('parentNode')
    }, plugin.getOptions('view'), { formData: data }))
    .on('formCancel', function() {
      plugin.trigger('hide', this);
    })
    .on('formSubmit', function(data) {
      plugin.trigger('submit', data, function() {
        awaiting = false;
      });
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
      'role': 'put-item',
      'text': __('编辑')
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
    if (!plugin.getOptions('interact')) {
      host.element.hide();
    }

    host.set('activePlugin', plugin);

    form.element.show();
  });

  plugin.on('hide', function(form) {
    if (!plugin.getOptions('interact')) {
      host.element.show();
    }

    host.set('activePlugin', null);

    form && form.destroy();
    delete plugin.exports;
  });

  plugin.on('submit', function(data, done) {
    if (awaiting) {
      return;
    }

    // 添加用于阻止多次点击
    awaiting = true;

    var actionPut = plugin.getOptions('PUT') || function(uniqueId, data) {
      return host[plugin.exports.get('method')](uniqueId, data);
    };

    actionPut(uniqueId, data)
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
