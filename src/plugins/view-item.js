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

  host.delegateEvents({
    'click [data-role=view-item]': function(e) {
      var id = getItemId(e.currentTarget);

      host.GET(id)
        .done(function(data) {
          plugin.trigger('show', id, data);
        })
        .fail(function() {

        })
        .always(function() {
          plugin.trigger('show', id, {
            "type_id": "物品类型id",
            "group_id": "分组id", //参见物品类型分组id定义
            "title": "物品名称",
            "note": "物品介绍",
            "icon_path": "图标地址",
            "send_role": "赠送方需拥有此角色才可以赠送",
            "expire_seconds": "有效秒数", //单位：秒
            "items": [ //礼包类的物品打开后可能得到的物品
              {
                "type_id": "物品类型id",
                "min": "随机得到该物品的最小数量",
                "max": "随机得到该物品的最大数量",
                "enum": [10, 20] //枚举数量
              }
            ],
            "update_time": "最后更新时间", //单位毫秒
            "receive_msg": ["答谢留言", "答谢留言"],
            "send_msg": "默认的赠送留言",
            "need_send_im": "填 1 如果要发系统君消息",
            "im_content": "系统君消息内容",
            "im_btn_txt": "系统君消息按键",
            "im_content_wb": "系统君消息微博标题"
          });
        });
    }
  });

  // 通知就绪
  this.ready();
};
