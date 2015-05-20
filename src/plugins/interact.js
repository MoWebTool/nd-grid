/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

// var $ = require('jquery');

var Alert = require('nd-alert');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var plugins = host.getPlugin();

  Object.keys(plugins).forEach(function(key) {
    if (key === 'interact') {
      return;
    }

    var plugin = plugins[key];
    var interact = plugin.getOptions('interact');

    if (!interact) {
      return;
    }

    if (interact.type === 'dialog') {
      plugin.setOptions('view', {
        className: 'ui-view-dialog',
        beforeRender: function() {
          var view = this;

          view.dialog = new Alert({
            // closeTpl: '',
            confirmTpl: '',
            message: '',
            title: interact.title,
            hideOnKeyEscape: false,
            events: {
              // override
              'click [data-role=close]': function(e) {
                e.preventDefault();
                plugin.trigger('hide', view);
              }
            }
          }).render();

          // change parentNode
          view.set('parentNode', view.dialog.$('[data-role="message"]'));
        },
        afterRender: function() {
          this.dialog.show();
        },
        beforeDestroy: function() {
          this.dialog.hide();
        }
      });
    }
  });

  // 通知就绪
  this.ready();
};
