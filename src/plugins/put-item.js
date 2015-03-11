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
    host = plugin.host,
    uniqueId;

  function makeForm(data) {
    var form = new MForm($.extend(true, {
      name: 'grid-put-item',
      // action: '',
      method: 'PUT',

      // 表单数据
      formData: data,

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

  // helpers

  function getItem(target) {
    return host.$(target).closest('[data-role=item]');
  }

  function getItemId(target) {
    return getItem(target).data('id');
  }

  host.get('itemActions').push({
    'role': 'put-item',
    'text': '编辑'
  });

  host.delegateEvents({
    'click [data-role=put-item]': function(e) {
      uniqueId = getItemId(e.currentTarget);

      if (!plugin.form) {
        host.GET(uniqueId)
        .done(function(data) {
          plugin.trigger('show', (plugin.form = makeForm(data).render()));
        })
        .fail(function(error) {
          Alert.show(error);
        });
      } else {
        plugin.trigger('show', plugin.form);
      }
    }
  });

  plugin.on('show', function(form) {
    host.element.hide();
    form.element.show();
  });

  plugin.on('hide', function(form) {
    host.element.show();
    form.destroy();
    delete plugin.form;
  });

  plugin.on('submit', function(data) {
    host.PUT(uniqueId, data)
      .done(function(/*data*/) {
        // 成功，刷新当前页
        host.getList();

        plugin.trigger('hide', plugin.form);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  });

  // 通知就绪
  this.ready();
};
