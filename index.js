/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var debug = require('nd-debug');
var Widget = require('nd-widget');
var Template = require('nd-template');
var RESTful = require('nd-restful');

var partials = {
  grid: require('./src/templates/partial-grid.handlebars'),
  card: require('./src/templates/partial-card.handlebars')
};

var buttonTpl = require('./src/templates/button.handlebars');

function makePlace(place) {
  // 位置
  if (!place) {
    return '[data-role="header"]';
  } else {
    if (place === 'both') {
      return '[data-role="header"],[data-role="footer"]';
    } else {
      return '[data-role="' + place + '"]';
    }
  }
}

/**
 * @class
 * @extends {Widget}
 * @implements {Template}
 * @param  {config} [config]   attrs
 */
var Grid = Widget.extend({

  // 使用 handlebars
  Implements: [Template, RESTful],

  Plugins: require('./src/plugins'),

  attrs: {
    // 统一样式前缀
    classPrefix: 'ui-grid',

    // 模板
    template: require('./src/templates/grid.handlebars'),

    partial: function(data) {
      var helpers = {
        uniqueId: function(uniqueId) {
          return this[uniqueId].value;
        },
        adapters: this.get('adapters'),
        isDisabled: this.get('isDisabled')
      };

      var theme = this.get('theme');

      if (theme === 'card') {
        data.hasHeader = !!(data.checkable || (data.itemActions && data.itemActions.length));

        var labelMap = this.get('labelMap');
        helpers.getLabel = function(key) {
          return labelMap[key];
        };
      }

      return partials[theme](data, {
        helpers: helpers
      });
    },

    theme: 'grid',

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
      viewItem: {},
      paginate: {}
    },

    // proxy: null,

    // 0: mysql or 1: mongodb or 2: no pagination
    mode: 0,

    params: {},

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
      // 2015/6/29 15:12:44
      // 增加整行禁止
      return (this.disabled === true || itemData.disabled === true) ?
        options.fn(this) : options.inverse(this);
    },

    //过滤数据
    outFilter: function(data) {
      return data;
    }
  },

  initAttrs: function(config) {
    Grid.superclass.initAttrs.call(this, config);

    this.set('model', {
      theme: this.get('theme')
    });
  },

  initProps: function() {
    var proxy = this.get('proxy');

    if (!proxy) {
      debug.error('请设置数据源（proxy）');
    } else {
      ['LIST', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE']
      .forEach(function(method) {
        proxy[method] && (this[method] = proxy[method].bind(proxy));
      }, this);
    }
  },

  initPlugins: function() {
    var labelMap = this.get('labelMap');
    var entryKey = this.get('entryKey');
    var checkable = this.get('checkable');
    var sortable = this.get('sortable');
    var mode = this.get('mode');

    var pluginCfg = this.get('pluginCfg');

    pluginCfg.sort.disabled = !sortable;

    pluginCfg.check.disabled = !checkable;

    if (!checkable) {
      pluginCfg.delCheck.disabled = true;
    }

    if (!labelMap[entryKey]) {
      pluginCfg.viewItem.disabled = true;
    }

    if (mode === 2) {
      pluginCfg.paginate.disabled = true;
    }

    if (pluginCfg.viewItem.disabled) {
      this.set('entryKey', null);
    }

    Grid.superclass.initPlugins.call(this);
  },

  setup: function() {
    this.set('params', $.extend((function(mode) {
      switch (mode) {
        case 2:
          return {};
        case 1:
          return {
            $count: true,
            size: 10,
            page: 0
          };
        default:
          return {
            $count: true,
            $limit: 10,
            $offset: 0
          };
      }
    })(this.get('mode')), this.get('params')));

    if (this.get('autoload')) {
      // 取列表
      this.getList();
    }
  },

  getList: function(options) {
    var that = this;

    if (options) {
      if (options.data) {
        this.set('params', options.data);
      }
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
            data: (function(mode) {
              switch (mode) {
                case 2:
                  return {};
                case 1:
                  return {
                    page: Math.ceil(data.count / params.size) - 1
                  };
                default:
                  return {
                    $offset: (Math.ceil(data.count / params.$limit) - 1) * params.$limit
                  };
              }
            })(that.get('mode'))
          });
        } else {
          that.set('gridData', data);
        }
      })
      .fail(function(error) {
        debug.error(error);
      });
  },

  deleteItem: function(id) {
    var item = this.getItemById(id),
      index, that = this,
      beDeleted,
      itemList = this.get('itemList'),
      mergeKey = this.get('mergeKey');

    // 动画
    item.fadeOut(function() {
      index = item.index();
      beDeleted = itemList[index];

      // 从 model 中移除
      itemList.splice(index, 1);
      //页面还有数据
      if (itemList.length) {
        //仅考虑mergeKey只有一个的情况
        if (mergeKey) {
          var mergeVal = beDeleted[mergeKey].value;
          var mergeIndex = beDeleted[mergeKey].index;
          itemList.forEach(function(item) {
            for (var key in item) {
              if (item.hasOwnProperty(key) && key === mergeKey && item[key].value === mergeVal) {
                item[key].count && item[key].count--;
                if (item[key].index > mergeIndex) {
                  item[key].index--;
                }
              }
            }
          });
          that.renderPartial(itemList);
        }
        // 从 DOM 中移除
        item.remove();
        that.trigger('deleteItemDone');
      }
      else {
        that.getList();
      }
    });
  },

  _onRenderGridData: function(gridData) {
    // 保存原始数据
    this.set('originData', gridData);

    // 拷贝一份数据给 filter
    gridData = this.get('outFilter').call(this, $.extend(true, {}, gridData));

    var items = gridData.items,
      entryKey,
      mergeKey,
      visKeys,
      extKeys,
      allKeys,
      itemList = [0];

    // 强制无数据时列表刷新
    itemList.hacked = true;

    if (items && items.length) {
      entryKey = this.get('entryKey');
      mergeKey = this.get('mergeKey');

      // keys that visible
      visKeys = Object.keys(this.get('labelMap'));

      // keys that invisible
      extKeys = Object.keys(items[0]).filter(function(key) {
        return visKeys.indexOf(key) === -1;
      });

      // sort keys by visibility
      allKeys = visKeys.concat(extKeys);

      itemList = items.map(function(item) {
        var _item = {};

        allKeys.forEach(function(key) {
          _item[key] = {
            key: key,
            value: item[key],
            visible: visKeys.indexOf(key) !== -1,
            isEntry: key === entryKey,
            isMerge: key === mergeKey,
            count: item.count,
            index: item.index,
            item: item
          };
        });

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
      // 回设
      this.set('itemList', itemList, {
        silent: true
      });
    }

    this.renderPartial(itemList);
  },

  renderPartial: function(itemList) {
    this._renderPartial(itemList);
  },

  _renderPartial: function(itemList) {
    this.$('.content').html(
      this.get('partial').call(this, {
        uniqueId: this.get('uniqueId'),
        checkable: this.get('checkable'),
        // if check all
        checked: this.get('checked'),
        labelMap: this.get('labelMap'),
        itemActions: this.get('itemActions'),
        theme: this.get('theme'),
        itemList: itemList || this.get('itemList')
      })
    );
  },

  addGridAction: function(options, fn, prepend) {
    this.$(makePlace(options.place))[prepend ? 'prepend' : 'append']
      (buttonTpl(options));

    fn && this.delegateEvents('click [data-role="' + options.role + '"]', fn);
  },

  addItemAction: function(options, index, fn) {
    var itemActions = this.get('itemActions');

    if (typeof index !== 'number') {
      itemActions.push(options);
    } else {
      itemActions.splice(index, 0, options);
    }

    fn && this.delegateEvents('click [data-role="' + options.role + '"]', fn);
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

  getItemDataById: function(id, purify) {
    var data = this.get('itemList')[this.getItemById(id).index()];

    if (purify) {
      var _data = {};
      Object.keys(data).forEach(function(key) {
        _data[key] = data[key].value;
      });
      return _data;
    }

    return data;
  }

});

module.exports = Grid;
