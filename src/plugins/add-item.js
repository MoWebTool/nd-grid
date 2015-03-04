/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Form = require('nd-form');
var FD = require('nd-formdata');
var Alert = require('nd-alert');

function makeForm(host, plugin) {
  var form = new Form($.extend(true, {
    // name: '',
    // action: '',
    method: 'POST',

    // 表单数据
    formData: {},

    dataParser: function() {
      return new FD(this.getElements()).toJSON();
    },

    // 数据相符校验，用于处理 formData 与 fields 匹配
    // matchers: {
      // test: function(value, match) {
      // return value === match[0].value;
      // }
    // },

    fields: [],

    buttons: [{
      label: '取消',
      type: 'button',
      role: 'form-cancel'
    }, {
      label: '添加',
      type: 'submit',
      role: 'form-submit'
    }],

    parentNode: '#main',

    events: {
      'click [data-role=form-cancel]': function() {
        plugin.trigger('hide');
      }
    }
  }, plugin.options))
  .on('submit', function(e) {
    e.preventDefault();
    plugin.trigger('submit', this.get('dataParser').call(this));
  });

  return form;
}

module.exports = function(host) {
  var plugin = this;

  host.get('gridActions').push({
    'role': 'add-item',
    'text': '新增'
  });

  host.delegateEvents({
    'click [data-role=add-item]': function() {
      if (!plugin.form) {
        plugin.form = new makeForm(host, plugin).render();
      }

      plugin.trigger('show');
    }
  });

  plugin.on('show', function() {
    host.element.hide();
    plugin.form.element.show();
  });

  plugin.on('hide', function() {
    host.element.show();
    plugin.form.element.hide();
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
        plugin.trigger('hide');
      })
      .fail(function(error) {
        Alert.show(error);
      });
  });

  // 通知就绪
  this.ready();
};
