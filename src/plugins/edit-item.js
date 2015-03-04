/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Form = require('nd-form');
var FD = require('nd-formdata');
var Alert = require('nd-alert');

/*jshint maxparams:4*/
function makeForm(host, plugin, id, data) {
  var form = new Form($.extend(true, {
    // name: '',
    // action: '',
    method: 'PATCH',

    // 表单数据
    formData: $.extend({
      'type_id': id
    }, data),

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
      label: '修改',
      type: 'submit',
      role: 'form-submit'
    }],

    parentNode: '#main',

    events: {
      'click [data-role=form-cancel]': function() {
        plugin.trigger('hide', id);
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

  // helpers

  function getItem(target) {
    return host.$(target).closest('[data-role=item]');
  }

  function getItemId(target) {
    return getItem(target).data('id');
  }

  host.get('itemActions').push({
    'role': 'edit-item',
    'text': '编辑'
  });

  host.delegateEvents({
    'click [data-role=edit-item]': function(e) {
      var id = getItemId(e.currentTarget),
        key = 'form-' + id;

      if (!plugin[key]) {
        host.GET(id)
        .done(function(data) {
          // TODO: hack 移到业务
          // 接口的 REST 不规范，采用 hack
          data = data.items[0];

          plugin[key] = new makeForm(host, plugin,
            getItemId(e.currentTarget), data).render();

          plugin.trigger('show', id);
        })
        .fail(function(error) {
          Alert.show(error);
        });
      } else {
        plugin.trigger('show', id);
      }
    }
  });

  plugin.on('show', function(id) {
    host.element.hide();
    plugin['form-' + id].element.show();
  });

  plugin.on('hide', function(id) {
    host.element.show();
    plugin['form-' + id].element.hide();
  });

  plugin.on('submit', function(id, data) {
    host.PATCH(id, data)
      .done(function(/*data*/) {
        // 成功，刷新当前页
        host.getList();

        plugin.trigger('hide', id);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  });

  // 通知就绪
  this.ready();
};
