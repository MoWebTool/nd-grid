/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
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
        'role': 'reload',
        'text': '刷新'
      }, button))
    );
  })(plugin.getOptions('button'));

  host.delegateEvents({
    'click [data-role="reload"]': function() {
      host.getList();
    }
  });

  // 通知就绪
  this.ready();
};
