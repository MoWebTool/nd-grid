/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

module.exports = function(host) {
  var plugin = this;

  // helpers

  function getItem(target) {
    return host.$(target).closest('[data-role=item]');
  }

  function getItemId(target) {
    return getItem(target).data('id');
  }

  host.get('itemActions').push({
    'role': 'edit-item',
    'text': '编辑'
  });

  host.delegateEvents({
    'click [data-role=edit-item]': function(e) {
      plugin.trigger('show', getItemId(e.currentTarget));
    }
  });

  plugin.on('submit', function(id, data) {
    host.PATCH(id, data)
      .done(function(data) {
        // 成功，刷新当前页
        host.getList();

        plugin.trigger('hide');
      })
      .fail(function() {

      })
      .always(function() {
        // 成功，刷新当前页
        host.getList();

        plugin.trigger('hide');
      });
  });

  // 通知就绪
  this.ready();
};
