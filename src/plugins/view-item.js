/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Dialog = require('nd-dialog');
var Alert = require('nd-alert');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  function makeDialog(id, data) {
    var dialog = new Dialog($.extend(true, {

      parentNode: host.get('parentNode'),

      data: null,

      afterHide: function() {
        plugin.trigger('hide', this);
      },

      onChangeData: function(data) {
        this.set('content', this.get('partial')(data));
      }
    }, plugin.options));

    dialog.set('data', data);

    return dialog;
  }

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

          plugin[key] = makeDialog(id, data).render();

          plugin.trigger('show', plugin[key]);
        })
        .fail(function(error) {
          Alert.show(error);
        });
      } else {
        plugin.trigger('show', plugin[key]);
      }
    }
  });

  plugin.on('show', function(dialog) {
    host.element.hide();
    dialog.show();
  });

  plugin.on('hide', function(/*dialog*/) {
    host.element.show();
    // plugin['dialog-' + id].hide();
  });

  // 通知就绪
  this.ready();
};
