/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');

var MForm = require('../modules/form');

/*jshint maxparams:4*/
function makeForm(host, plugin, id, data) {
  data || (data = {});

  data[host.get('uniqueId')] = id;

  var form = new MForm($.extend(true, {
    // name: '',
    // action: '',
    method: 'PUT',

    // 表单数据
    formData: data,

    parentNode: host.get('parentNode'),

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
    'role': 'put-item',
    'text': '编辑'
  });

  host.delegateEvents({
    'click [data-role=put-item]': function(e) {
      var id = getItemId(e.currentTarget),
        key = 'form-' + id;

      if (!plugin[key]) {
        host.GET(id)
        .done(function(data) {
          // TODO: hack 移到业务
          // 接口的 REST 不规范，采用 hack
          data = data.items[0];

          plugin[key] = new makeForm(host, plugin, id, data).render();

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
    host.PUT(id, data)
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
