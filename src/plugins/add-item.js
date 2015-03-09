/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');

var MForm = require('../modules/form');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  function makeForm() {
    var form = new MForm($.extend(true, {
      // name: '',
      // action: '',
      method: 'POST',

      parentNode: host.get('parentNode')
    }, plugin.options))
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

  host.get('gridActions').push({
    'role': 'add-item',
    'text': '新增'
  });

  host.delegateEvents({
    'click [data-role=add-item]': function() {
      if (!plugin.form) {
        plugin.form = makeForm().render();
      }

      plugin.trigger('show', plugin.form);
    }
  });

  plugin.on('show', function(form) {
    host.element.hide();
    form.element.show();
  });

  plugin.on('hide', function(form) {
    host.element.show();
    form.element.hide();
  });

  plugin.on('submit', function(data) {
    host.POST(data)
      .done(function(/*data*/) {
        // 成功，返回第一页
        host.getList({
          offset: 0
        });

        // 重置
        plugin.form.element[0].reset();

        // 隐藏
        plugin.trigger('hide', plugin.form);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  });

  // 通知就绪
  this.ready();
};
