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
    options = plugin.options || {},
    uniqueId,
    awaiting;

  function makeDialog(data) {
    return new Dialog($.extend(true, {

      parentNode: host.get('parentNode'),

      partial: function(data) {
        return data.toString ? data.toString() : data;
      },

      afterHide: function() {
        plugin.trigger('hide', this);
      },

      afterRender: function() {
        this.set('content', this.get('partial').call(this, data));
      }

    }, options));
  }

  host.delegateEvents({
    'click [data-role=view-item]': function(e) {
      if (awaiting) {
        return;
      }

      if (!plugin.exports) {
        // 添加用于阻止多次点击
        awaiting = true;

        uniqueId = host.getItemIdByTarget(e.currentTarget);

        host.GET(uniqueId)
        .done(function(data) {
          plugin.exports = makeDialog(data).render();
          plugin.trigger('show', plugin.exports);
        })
        .fail(function(error) {
          Alert.show(error);
        })
        .always(function() {
          awaiting = false;
        });
      } else {
        plugin.trigger('show', plugin.exports);
      }
    }
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  plugin.on('show', function(dialog) {
    // 通知就绪
    // plugin.ready();

    dialog.show();
  });

  plugin.on('hide', function(dialog) {
    dialog.destroy();
    delete plugin.exports;
  });

  // 通知就绪
  this.ready();
};
