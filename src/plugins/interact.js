/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

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
        beforeSetup: function() {
          this.before('render', function() {
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
          });

          this.after('render', function() {
            this.dialog.show();
          });

          this.before('destroy', function() {
            this.dialog.hide();
          });
        }
      });
    }
  });

  // 通知就绪
  this.ready();
};
