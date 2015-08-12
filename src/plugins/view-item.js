/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var debug = require('nd-debug');

var View = require('../modules/view');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    uniqueId,
    awaiting;

  function makeView(data, trigger) {
    return new View($.extend(true, {

      parentNode: host.get('parentNode'),

      trigger: trigger,

      events: {
        'click [data-role="back"]': function() {
          plugin.trigger('hide', this);
        }
      },

      labelMap: {},
      valueMap: data

    }, plugin.getOptions('view')));
  }

  host.delegateEvents({
    'click [data-role="view-item"]': function(e) {
      if (awaiting) {
        return;
      }

      if (!plugin.exports) {
        // 添加用于阻止多次点击
        awaiting = true;

        var trigger = e.currentTarget;

        uniqueId = host.getItemIdByTarget(trigger);

        var actionFetch = plugin.getOptions('GET') || function(uniqueId) {
          return host.GET(uniqueId);
        };

        if (actionFetch === 'LOCAL') {
          actionFetch = function(uniqueId) {
            var defer = $.Deferred();
            defer.resolve(host.getItemDataById(uniqueId, true));
            return defer.promise();
          };
        }

        actionFetch(uniqueId)
        .done(function(data) {
          plugin.exports = makeView(data, trigger).render();
          plugin.trigger('show', plugin.exports);
        })
        .fail(function(error) {
          debug.error(error);
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

  plugin.on('show', function(view) {
    if (!this.getOptions('interact')) {
      host.element.hide();
    }

    view.element.show();
  });

  plugin.on('hide', function(view) {
    if (!this.getOptions('interact')) {
      host.element.show();
    }

    view.destroy();
    delete plugin.exports;
  });

  // 通知就绪
  this.ready();
};
