/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var ajax = require('nd-ajax');
var Alert = require('nd-alert');
var Widget = require('nd-widget');
var Template = require('nd-template');
var RESTful = require('nd-restful');

module.exports = Widget.extend({

  // 使用 handlebars
  Implements: [Template, RESTful],

  attrs: {
    // 统一样式前缀
    classPrefix: 'ui-grid',

    // 模板
    template: require('./src/templates/grid.handlebars'),

    partial: function(data) {
      var template = require('./src/templates/partial.handlebars');

      return template(data, {
        helpers: {
          uniqueId: function(uniqueId) {
            return this[uniqueId].value;
          },
          isEntryKey: function(entryKey, options) {
            return this.key === entryKey ? options.fn(this) : options.inverse(this);
          },
          adapters: this.get('adapters'),
          isDisabled: this.get('isDisabled')
        }
      });
    },

    // 行处理
    itemActions: [],

    // 全局处理
    gridActions: [],

    // 分页处按钮
    pageActions: [],

    // 数据
    model: {},

    uniqueId: 'id',
    entryKey: {
      getter: function(value) {
        return (typeof value === 'undefined') ? this.get('uniqueId') : value;
      }
    },
    labelMap: {},

    checkable: false,

    plugins: require('./src/plugins'),

    proxy: function(options) {
      // MUST, for restful
      options.baseUri = this.get('baseUri');

      return ajax(options);
    },

    params: {
      limit: 10,
      offset: 0
    },

    // 服务端返回的原始数据
    gridData: null,

    // 解析后的数据列表
    itemList: null,

    // 数据处理，放在 handlebars 中进行
    adapters: function(key, value) {
      return value;
    },

    isDisabled: function(itemData, options) {
      return this.disabled ? options.fn(this) : options.inverse(this);
    }
  },

  setup: function() {
    // 列表项操作按钮
    this.__actions = [];

    // 初始化插件
    this.initPlugins();

    // 取列表
    this.getList();
  },

  initPlugins: function() {
    var that = this,
      plugins = this.get('plugins'),
      labelMap = this.get('labelMap'),
      entryKey = this.get('entryKey'),
      delCheck = plugins.delCheck,
      viewItem = plugins.viewItem;

    // checkboxes
    plugins.check.disabled = !this.get('checkable');

    // delCheck's dependencies
    if (!delCheck.disabled) {
      $.each(delCheck.dependencies, function(i, item) {
        plugins[item].disabled = false;
      });
    }

    if (!labelMap[entryKey]) {
      viewItem.disabled = true;
    }

    if (viewItem.disabled) {
      this.set('entryKey', null);
    }

    // boot
    $.each(plugins, function(i, item) {
      if (!item.disabled) {
        that.addPlugin(item.name, item.plugin, item.callbacks);
      }
    });
  },

  getList: function(params) {
    var that = this;

    if (params) {
      this.set('params', params);
    }

    this.LIST(this.get('params'))
      .done(function(data) {
        that.set('gridData', data);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  },

  deleteItem: function(id) {
    var item = this.getItemById(id),
      index = item.index(),
      itemList = this.get('itemList');

    // 从 model 中移除
    itemList.splice(index, 1);

    // 从 DOM 中移除
    item.remove();

    // 判断当前行数
    if (!itemList.length) {
      this.getList();
    }
  },

  _onRenderGridData: function(gridData) {
    var items = gridData.items,
      labelMap,
      uniqueId,
      entryKey,
      itemList = [];

    if (items && items.length) {
      labelMap = this.get('labelMap');
      uniqueId = this.get('uniqueId');
      entryKey = this.get('entryKey');

      itemList = $.map(items, function(item) {
        // 仅取 labelMap 中定义的字段
        var _item = {};

        $.each(labelMap, function(key/*, value*/) {
          _item[key] = {
            key: key,
            value: item[key],
            visible: true,
            isEntry: key === entryKey
          };
        });

        // 如果 uniqueId 不在 labelMap 中
        // 加入隐藏的 uniqueId
        if (!(uniqueId in labelMap)) {
          _item[uniqueId] = {
            key: uniqueId,
            value: item[uniqueId]
          };
        }

        return _item;
      });

      this.set('itemList', itemList);
    }
  },

  _onRenderItemList: function(itemList) {
    this.$('.content').html(
      this.get('partial').call(this, {
        uniqueId: this.get('uniqueId'),
        checkable: this.get('checkable'),
        labelMap: this.get('labelMap'),
        itemActions: this.getItemActions(),
        itemList: itemList
      })
    );
  },

  addItemAction: function(options) {
    this.__actions.push(options);
  },

  getItemActions: function() {
    return this.__actions;
  },

  getItems: function() {
    return this.$('[data-role="item"]');
  },

  getItemByTarget: function(target) {
    return this.$(target).closest('[data-role="item"]');
  },

  getItemById: function(id) {
    return this.$('[data-id="' + id + '"]');
  },

  getItemId: function(item) {
    return item.data('id');
  },

  getItemIdByTarget: function(target) {
    return this.getItemId(this.getItemByTarget(target));
  }

});
