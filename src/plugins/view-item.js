/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Dialog = require('nd-dialog');
var Alert = require('nd-alert');

/*jshint maxparams:4*/
function makeDialog(host, plugin, id, data) {
  var dialog = new Dialog($.extend(true, {

    parentNode: host.get('parentNode'),

    data: null,

    afterHide: function() {
      plugin.trigger('hide', id);
    },

    onChangeData: function(data) {
      this.set('content', this.get('partial')(data));
    }
  }, plugin.options));

  dialog.set('data', data);

  return dialog;
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

  host.delegateEvents({
    'click [data-role=view-item]': function(e) {
      var id = getItemId(e.currentTarget),
        key = 'dialog-' + id;

      if (!plugin[key]) {
        host.GET(id)
        .done(function(data) {
          // TODO: hack 移到业务
          // 接口的 REST 不规范，采用 hack
          data = data.items[0];

          plugin[key] = new makeDialog(host, plugin, id, data).render();

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
    plugin['dialog-' + id].show();
  });

  plugin.on('hide', function(/*id*/) {
    host.element.show();
    // plugin['dialog-' + id].hide();
  });

  // 通知就绪
  this.ready();
};
