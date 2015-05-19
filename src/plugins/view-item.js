/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Dialog = require('nd-dialog');
var Alert = require('nd-alert');
var Tip = require('nd-tip');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    uniqueId,
    awaiting;

  function makeDialog(data, trigger) {
    var interact = plugin.getOptions('interact');
    var UI = (interact && interact.type === 'tip') ? Tip : Dialog;

    return new UI($.extend(true, {

      parentNode: host.get('parentNode'),

      // for tip
      trigger: trigger,
      arrowPosition: 10,

      partial: function(data) {
        return data.toString ? data.toString() : data;
      },

      afterHide: function() {
        plugin.trigger('hide', this);
      },

      afterRender: function() {
        this.set('content', this.get('partial').call(this, data));
      }

    }, plugin.getOptions('view')));
  }

  host.delegateEvents({
    'click [data-role="view-item"]': function(e) {
      // e.stopPropagation();
      if (awaiting) {
        return;
      }

      if (!plugin.exports) {
        // 添加用于阻止多次点击
        awaiting = true;

        var trigger = e.currentTarget;

        uniqueId = host.getItemIdByTarget(trigger);

        host.GET(uniqueId)
        .done(function(data) {
          plugin.exports = makeDialog(data, trigger).render();
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
    dialog.show();
  });

  plugin.on('hide', function(dialog) {
    dialog.destroy();
    delete plugin.exports;
  });

  // 通知就绪
  this.ready();
};
