/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var helpers = require('../helpers');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  // 添加按钮到顶部
  (function(button) {
    host.$(helpers.makePlace(button)).append(
      helpers.makeButton($.extend({
        role: 'history-back',
        text: '返回'
      }, button))
    );
  })(plugin.getOptions('button'));

  host.delegateEvents({

    'click [data-role="history-back"]': function() {
      host.trigger('hide');
    }

  });

  // 通知就绪
  this.ready();
};
