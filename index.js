/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var Widget = require('nd-widget');
var Template = require('nd-template');

var Grid = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  Plugins: require('./src/plugins'),

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
    mergeKey: '',
    uniqueId: 'id',
    entryKey: {
      getter: function(value) {
        return (typeof value === 'undefined') ? this.get('uniqueId') : value;
      }
    },
    labelMap: {},

    checkable: false,
    // 是否可按字段排序
    // boolean, or array for sortable columns
    sortable: false,

    pluginCfg: {
      sort: {},
      check: {},
      delCheck: {},
      viewItem: {}
    },

    // proxy: null,

    // 0: mysql or 1: mongodb
    mode: 0,

    params: {
      $count: true
    },

    autoload: true,

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
    },

    //过滤数据
    outFilter: function(data) {
      return data;
    }
  },

  setup: function() {
    // 列表项操作按钮
    this.__actions = [];

    this.set('params', this.get('mode') ? {
      size: 10,
      page: 0
    } : {
      $limit: 10,
      $offset: 0
    });

    if (!this.get('proxy')) {
      console.error('请设置数据源（proxy）');
    }

    if (this.get('autoload')) {
      // 取列表
      this.getList();
    }
  },

  LIST: function() {
    var proxy = this.get('proxy');
    return proxy.LIST.apply(proxy, arguments);
  },

  GET: function() {
    var proxy = this.get('proxy');
    return proxy.GET.apply(proxy, arguments);
  },

  PUT: function() {
    var proxy = this.get('proxy');
    return proxy.PUT.apply(proxy, arguments);
  },

  PATCH: function() {
    var proxy = this.get('proxy');
    return proxy.PATCH.apply(proxy, arguments);
  },

  POST: function() {
    var proxy = this.get('proxy');
    return proxy.POST.apply(proxy, arguments);
  },

  DELETE: function() {
    var proxy = this.get('proxy');
    return proxy.DELETE.apply(proxy, arguments);
  },

  initPlugins: function() {
    var labelMap = this.get('labelMap');
    var entryKey = this.get('entryKey');
    var checkable = this.get('checkable');
    var sortable = this.get('sortable');

    var pluginCfg = this.get('pluginCfg');

    pluginCfg.sort.disabled = !sortable;

    pluginCfg.check.disabled = !checkable;

    if (!checkable) {
      pluginCfg.delCheck.disabled = true;
    }

    if (!labelMap[entryKey]) {
      pluginCfg.viewItem.disabled = true;
    }

    if (pluginCfg.viewItem.disabled) {
      this.set('entryKey', null);
    }

    Grid.superclass.initPlugins.call(this);
  },

  getList: function(options) {
    var that = this;

    if (options) {
      this.set('params', options.data);
    } else {
      options = {};
    }

    var params = options.data = $.extend({}, this.get('params'));

    Object.keys(params).forEach(function(key) {
      // 空字符串不提交查询
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.LIST(options)
      .done(function(data) {
        // offset 溢出
        if (data.count && !data.items.length) {
          // 到最后一页
          that.getList({
            data: that.get('mode') ? {
              page: (Math.ceil(data.count / params.size) - 1 )
            } : {
              $offset: (Math.ceil(data.count / params.$limit) - 1 ) * params.$limit
            }
          });
        } else {
          that.set('gridData', data);
        }
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
    // 保存原始数据
    this.set('originData', gridData);

    // 拷贝一份数据给 filter
    gridData = this.get('outFilter').call(this, $.extend(true, {}, gridData));

    var items = gridData.items,
      labelMap,
      uniqueId,
      entryKey,
      mergeKey,
      itemList = [0];

    // 强制无数据时列表刷新
    itemList.hacked = true;

    if (items && items.length) {
      labelMap = this.get('labelMap');
      uniqueId = this.get('uniqueId');
      entryKey = this.get('entryKey');
      mergeKey = this.get('mergeKey');

      itemList = $.map(items, function(item) {
        // 仅取 labelMap 中定义的字段
        var _item = {};

        $.each(labelMap, function(key/*, value*/) {
          _item[key] = {
            key: key,
            value: item[key],
            visible: true,
            isEntry: key === entryKey,
            isMerge: key === mergeKey,
            count: item.count,
            index:item.index
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

      delete itemList.hacked;
    }

    this.set('itemList', itemList);
  },

  _onRenderItemList: function(itemList) {
    if (itemList.hacked) {
      // 重置
      itemList = [];
      // 清除 hack
      delete itemList.hacked;
    }

    this.renderPartial(itemList);
  },

  renderPartial: function(itemList) {
    this.$('.content').html(
      this.get('partial').call(this, {
        uniqueId: this.get('uniqueId'),
        checkable: this.get('checkable'),
        labelMap: this.get('labelMap'),
        itemActions: this.getItemActions(),
        itemList: itemList || this.get('itemList')
      })
    );
  },

  addItemAction: function(options, index) {
    if (typeof index === 'undefined') {
       this.__actions.push(options);
    } else {
      this.__actions.splice(index, 0, options);
    }
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
  },

  getItemDataById: function(id) {
    return this.get('itemList')[this.getItemById(id).index()];
  }

});

module.exports = Grid;
