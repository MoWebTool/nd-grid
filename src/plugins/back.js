/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('nd-jquery');

var __ = require('nd-i18n');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  host.addGridAction($.extend({
    role: 'history-back',
    text: __('返回')
  }, plugin.getOptions('button')), function() {
    host.trigger('hide');
  });

  // 通知就绪
  this.ready();
};
