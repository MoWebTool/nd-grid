/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

module.exports = function(host) {
  var plugin = this;

  host.get('gridActions').push({
    'role': 'add-item',
    'text': '新增'
  });

  host.delegateEvents({
    'click [data-role=add-item]': function() {
      plugin.trigger('show');
    }
  });

  plugin.on('submit', function(data) {
    host.POST(data)
      .done(function(data) {
        // 成功，返回第一页
        host.getList({
          offset: 0
        });

        // 隐藏
        plugin.trigger('hide');
      })
      .fail(function() {
      })
      .always(function() {
      });
  });

  // 通知就绪
  this.ready();
};
