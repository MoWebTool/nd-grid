/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-06 16:09:55
 */

'use strict';

var $ = require('jquery');

var MForm = require('../modules/form');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  // 在 ready 后执行，让 callback 先设置 options
  // TODO: 存在问题：不支持 options 为异步的情况
  new MForm($.extend(true, {
    className: 'ui-form-search',
    buttons: [{
      label: '提交',
      type: 'submit',
      role: 'form-submit'
    }],
    parentNode: host.element,
    insertInto: function(element, parentNode) {
      element.prependTo(parentNode);
    }
  }, plugin.options))
  .on('formSubmit', function() {
    // 调用队列
    this.queue.run(function() {
      plugin.trigger('submit', this.get('dataParser').call(this));
    });
    // 阻止默认事件发生
    return false;
  }).render();

  plugin.on('submit', function(data) {
    host.getList(data);
  });

  // 通知就绪
  this.ready();
};
