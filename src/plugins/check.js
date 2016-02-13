/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var __ = require('nd-i18n');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  // helpers

  function getChecked() {
    return host.$('[name="check-item"]:checked');
  }

  function getCheckAll() {
    return host.$('[data-role="check-all"]');
  }

  function getCheckItems() {
    return host.$('[name="check-item"]');
  }

  host.delegateEvents({

    'click [data-role="item"]': function(e) {
      if (e.target.tagName === 'TD') {
        $(e.currentTarget).find('[name="check-item"]').trigger('click');
      }
    },

    // 全选
    'change [data-role="check-all"]': function(e) {
      getCheckItems().prop('checked', e.currentTarget.checked).trigger('change');
    },

    // 选中行
    'change [name="check-item"]': function(e) {
      var checked = e.currentTarget.checked,
        checkAll = getCheckAll();

      // li|tr
      host.getItemByTarget(e.currentTarget)
        .toggleClass('selected', checked);

      if (checked) {
        if (getChecked().length === getCheckItems().length) {
          checkAll.prop('checked', true);
        }
      } else {
        if (checkAll.prop('checked')) {
          checkAll.prop('checked', false);
        }
      }
    }

  });

  // 卡片式
  if (host.get('theme') === 'card') {
    var label = __('全选');
    // 添加按钮到顶部
    host.addGridAction($.extend({
      role: 'check-all-button',
      text: '<input data-role="check-all" type="checkbox" title="' + label + '">' + label
    }, plugin.getOptions('button')), function(e) {
      if (e.target.tagName !== 'INPUT') {
        $(e.currentTarget).find('input').trigger('click');
      }
    });
  }

  // 未全部选中的状态下，
  // 将未选中项全部删除后，
  // 需要重新设置全选按钮（checkbox）状态
  host.on('deleteItemDone', function() {
    getCheckAll().prop('checked', getChecked().length === getCheckItems().length);
  });

  // 通知就绪
  this.ready();
};
