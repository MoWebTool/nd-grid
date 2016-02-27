/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('nd-jquery');

var __ = require('nd-i18n');
var debug = require('nd-debug');
var Promise = require('nd-promise');

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

  function startup(e) {
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
          return Promise.resolve(host.getItemDataById(uniqueId, true));
        };
      }

      actionFetch(uniqueId)
        .then(function(data) {
          plugin.exports = makeView(data, trigger).render();
          plugin.trigger('show', plugin.exports);
        })
        .catch(function(error) {
          debug.error(error);
        })
        .finally(function() {
          awaiting = false;
        });
    } else {
      plugin.trigger('show', plugin.exports);
    }
  }

  (function(button) {
    if (!button) {
      return host.delegateEvents({
        'click [data-role="view-item"]': startup
      });
    }

    host.addItemAction($.extend({
      'role': 'view-item',
      'text': __('查看详情')
    }, button), button && button.index, startup);
  })(plugin.getOptions('button'));

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  plugin.on('show', function(view) {
    if (!plugin.getOptions('interact')) {
      host.element.hide();
    }

    // host.set('sub', {
    //   instance: view
    // });

    view.element.show();
  });

  plugin.on('hide', function(view) {
    if (!plugin.getOptions('interact')) {
      host.element.show();
    }

    // host.set('sub', null);

    view && view.destroy();
    delete plugin.exports;
  });

  // 通知就绪
  this.ready();
};
