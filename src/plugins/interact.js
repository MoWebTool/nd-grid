/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Alert = require('nd-alert');
var Tip = require('nd-tip');

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

    function inject() {
      if (interact.type === 'dialog') {
        plugin.setOptions('view', {
          className: 'ui-view-dialog',
          beforeSetup: function() {
            this.before('render', function() {
              var view = this;

              view.dialog = new Alert({
                // width: 360,
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
      } else if (interact.type === 'tip') {
        plugin.setOptions('view', {
          className: 'ui-view-tip',
          beforeSetup: function() {
            this.before('render', function() {
              var view = this;

              view.tip = new Tip({
                trigger: this.get('trigger'),
                triggerType: 'click',
                content: '',
                arrowPosition: 10,
                inViewport: true,
                afterHide: function() {
                  plugin.trigger('hide', view);
                }
              }).render();

              // change parentNode
              view.set('parentNode', view.tip.$('[data-role="content"]'));
            });

            this.after('render', function() {
              this.tip.show();
            });

            this.before('destroy', function() {
              this.tip.destroy();
            });
          }
        });
      }
    }

    if (plugin._async) {
      if (plugin._ready) {
        inject();
      } else {
        plugin.on('ready', inject);
      }
    } else {
      inject();
    }
  });

  // 通知就绪
  this.ready();
};
