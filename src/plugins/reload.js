/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var helpers = require('../helpers');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {};

  // 添加按钮到顶部
  host.$(helpers.makePlace(options.button)).append(
    helpers.makeButton($.extend({
      'role': 'reload',
      'text': '刷新'
    }, options.button))
  );

  // 移除参数
  delete options.button;

  host.delegateEvents({
    'click [data-role="reload"]': function() {
      host.getList();
    }
  });

  // 通知就绪
  this.ready();
};
