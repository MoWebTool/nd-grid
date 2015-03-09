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
    var that = this;
    // 调用队列
    this.queue.run(function() {
      plugin.trigger('submit', that.get('dataParser').call(that));
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
