/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  // helpers

  function getChecked() {
    return host.$('[name=check-item]:checked');
  }

  function getCheckAll() {
    return host.$('[data-role=check-all]');
  }

  function getCheckItems() {
    return host.$('[name=check-item]');
  }

  host.delegateEvents({

    // 全选
    'change [data-role=check-all]': function(e) {
      getCheckItems().prop('checked', e.currentTarget.checked);
    },

    // 选中行
    'change [name=check-item]': function(e) {
      var checked = e.currentTarget.checked,
        checkAll = getCheckAll();

      host.getItemByTarget(e.currentTarget).toggleClass('selected', checked);

      if (checked) {
        if (getChecked().length === host.get('itemList').length) {
          checkAll.prop('checked', true);
        }
      } else {
        if (checkAll.prop('checked')) {
          checkAll.prop('checked', false);
        }
      }
    }

  });

  // 未全部选中的状态下，
  // 将未选中项全部删除后，
  // 需要重新设置全选按钮（checkbox）状态
  host.after('deleteItem', function() {
    getCheckAll().prop('checked', getChecked().length === host.get('itemList').length);
  });

  // 通知就绪
  this.ready();
};
