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
    host = plugin.host,
    uniqueId;

  function makeDialog(data) {
    var dialog = new Dialog($.extend(true, {

      parentNode: host.get('parentNode'),

      partial: function(data) {
        return data.toString ? data.toString() : data;
      },

      afterHide: function() {
        plugin.trigger('hide', this);
      },

      afterRender: function() {
        this.set('content', this.get('partial')(data));
      }

    }, plugin.options));

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
      uniqueId = getItemId(e.currentTarget);

      if (!plugin.dialog) {
        host.GET(uniqueId)
        .done(function(data) {
          plugin.trigger('show', (plugin.dialog = makeDialog(data).render()));
        })
        .fail(function(error) {
          Alert.show(error);
        });
      } else {
        plugin.trigger('show', plugin.dialog);
      }
    }
  });

  plugin.on('show', function(dialog) {
    dialog.show();
  });

  plugin.on('hide', function(dialog) {
    dialog.destroy();
    delete plugin.dialog;
  });

  // 通知就绪
  this.ready();
};
