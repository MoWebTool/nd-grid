/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

module.exports = function(host) {

  // helpers

  function getItem(target) {
    return host.$(target).closest('[data-role=item]');
  }

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

      getItem(e.currentTarget).toggleClass('selected', checked);

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

  // 通知就绪
  this.ready();
};
