/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var FormExtra = require('nd-form-extra');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {},
    uniqueId;

  function makeForm(data) {
    var form = new FormExtra($.extend(true, {
      name: 'grid-put-item',
      // action: '',
      method: 'PUT',

      // 表单数据
      formData: data,

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

    return form;
  }

  host.addItemAction($.extend({
    'role': 'put-item',
    'text': '编辑'
  }, options.button));

  host.delegateEvents({
    'click [data-role="put-item"]': function(e) {
      uniqueId = host.getItemIdByTarget(e.currentTarget);

      if (!plugin.exports) {
        host.GET(uniqueId)
        .done(function(data) {
          plugin.trigger('show', (plugin.exports = makeForm(data).render()));
        })
        .fail(function(error) {
          Alert.show(error);
        });
      } else {
        plugin.trigger('show', plugin.exports);
      }
    }
  });

  plugin.on('show', function(form) {
    // 通知就绪
    plugin.ready();

    host.element.hide();
    form.element.show();
  });

  plugin.on('hide', function(form) {
    host.element.show();
    form.destroy();
    delete plugin.exports;
  });

  plugin.on('submit', function(data) {
    host.PUT(uniqueId, data)
      .done(function(/*data*/) {
        // 成功，刷新当前页
        host.getList();

        plugin.trigger('hide', plugin.exports);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  });

  // 通知就绪
  // this.ready();
};
