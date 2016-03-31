/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')

var __ = require('nd-i18n')
var debug = require('nd-debug')
var Widget = require('nd-widget')
var Template = require('nd-template')
var Promise = require('nd-promise')

var SubHandler = require('./src/helpers/sub-handler')

var CLS_NEST_EXPANDER_EXPANDED = 'nest-expander-expanded'

/**
 * @class
 * @extends {Widget}
 * @implements {Template}
 * @param  {config} [config]   attrs
 */
var Grid = Widget.extend({

  // 使用 handlebars
  Implements: [Template, SubHandler],

  Plugins: require('./src/plugins'),

  templatePartials: {
    header: require('./src/templates/partial-header.handlebars'),
    nest: require('./src/templates/partial-nest.handlebars'),
    card: require('./src/templates/partial-card.handlebars'),
    content: function(model, templateOptions) {
      return templateOptions.partials[this.get('theme')](model, templateOptions)
    }
  },

  attrs: {
    // 统一样式前缀
    classPrefix: 'ui-grid',

    // 模板
    template: require('./src/templates/grid.handlebars'),

    templateHelpers: {
      value: null,
      getter: function() {
        var sortable = this.get('sortable')

        return {
          isSortKey: function(key, options) {
            return (typeof sortable === 'boolean' ? sortable :sortable.indexOf(key) !== -1) ? options.fn(this) : options.inverse(this)
          },
          isDisabled: this.get('isDisabled')
        }
      }
    },

    theme: 'nest',

    // 行处理
    itemActions: [],

    // 全局处理
    gridActions: [],

    // 分页处按钮
    pageActions: [],

    // 当前显示的类 modal 模式的插件
    activePlugin: null,

    // 数据
    model: {},
    mergeKey: '',
    uniqueId: 'id',
    entryKey: {
      getter: function(value) {
        return (typeof value === 'undefined') ? this.get('uniqueId') : value
      }
    },
    // 多级嵌套
    childKey: null,
    labelMap: {},

    // 未在 labelMap 中定义的字段，
    // 如果需要被存储，请设置 extKeys = [x, y, z]
    extKeys: null,

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

    // 0: mysql/mongodb
    // 2: no pagination
    mode: 0,

    initialParams: {
      $offset: 0,
      $limit: 20,
      $count: true
    },

    params: {},

    autoload: true,

    // 服务端返回的原始数据
    gridData: null,

    // 解析后的数据列表
    itemList: null,

    // 数据处理
    adapters: function(key, value/*, item*/) {
      return value
    },

    isDisabled: function(itemData, options) {
      var disabled = this.disabled

      if (typeof disabled === 'function') {
        disabled = disabled(itemData)
      }

      return (disabled === true ||
        // 整行禁止
        (itemData.disabled && (itemData.disabled === true || itemData.disabled.value === true))) ?
        options.fn(this) : options.inverse(this)
    },

    //过滤数据
    inFilter: function(data) {
      return data
    },

    //过滤数据
    outFilter: function(data) {
      return data
    },

    // 是否保护子视图，避免间接关闭，比如点击其它 route
    holdSubView: false
  },

  initAttrs: function(config) {
    Grid.superclass.initAttrs.call(this, config)

    this.set('model', {
      theme: this.get('theme')
    })

    if (this.get('mode') === 2) {
      this.set('initialParams', null)
    }
  },

  initProps: function() {
    var proxy = this.get('proxy')

    if (!proxy) {
      debug.log(__('请设置数据源（proxy）'))
    }

    ['LIST', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE']
    .forEach(function(method) {
      if (proxy && proxy[method]) {
        this[method] = proxy[method].bind(proxy)
      } else if (!this[method]) {
        this[method] = function() {
          debug.log(__('数据源（proxy）缺少`' + method + '`方法'))
          return Promise.resolve({})
        }
      }
    }, this)
  },

  initPlugins: function() {
    var checkable = this.get('checkable')
    var sortable = this.get('sortable')
    var mode = this.get('mode')

    var pluginCfg = this.get('pluginCfg')

    pluginCfg.sort.disabled = !sortable

    pluginCfg.check.disabled = !checkable

    if (!checkable) {
      pluginCfg.delCheck.disabled = true
    }

    if (mode === 2) {
      pluginCfg.paginate.disabled = true
    }

    Grid.superclass.initPlugins.call(this)
  },

  setup: function() {
    if (this.get('holdSubView')) {
      this.on('change:sub', this.handleChanged)
    }

    // 保存原始状态
    this.set('initialParams', this.get('params'))

    // 设置最终状态
    this.set('params', this.get('initialParams'))

    if (this.get('autoload')) {
      // 取列表
      this.getList()
    }

    if (this.get('childKey')) {
      this.delegateEvents({
        'click .nest-expander': function(e) {
          e.preventDefault()
          e.stopPropagation()
          var expander = $(e.currentTarget)
          if (expander.hasClass(CLS_NEST_EXPANDER_EXPANDED)) {
            expander.removeClass(CLS_NEST_EXPANDER_EXPANDED)
            this.hideNested(expander)
          } else {
            expander.addClass(CLS_NEST_EXPANDER_EXPANDED)
            this.showNested(expander)
          }
        }
      })
    }
  },

  hideNested: function(expander) {
    expander.removeClass(CLS_NEST_EXPANDER_EXPANDED)

    var that = this
    that.$('[data-parent="' + expander.data('index') + '"]').each(function(i, item) {
      expander = $(item).attr('hidden', true).find('.' + CLS_NEST_EXPANDER_EXPANDED)
      if (expander.hasClass(CLS_NEST_EXPANDER_EXPANDED)) {
        that.hideNested(expander)
      }
    })
  },

  showNested: function(expander) {
    expander.addClass(CLS_NEST_EXPANDER_EXPANDED)
    this.$('[data-parent="' + expander.data('index') + '"]').attr('hidden', false)
  },

  getList: function(options) {
    var that = this

    if (options) {
      if (options.data) {
        this.set('params', options.data)
      }
    } else {
      options = {}
    }

    var inFilter = this.get('inFilter')

    // maybe destroyed
    if (!inFilter) {
      return
    }
    var params = options.data =
      // 开放给外部处理
      inFilter.call(this, $.extend({}, this.get('params')))

    Object.keys(params).forEach(function(key) {
      // 空字符串不提交查询
      if (params[key] === '') {
        delete params[key]
      }
    })

    this.LIST(options)
      .then(function(data) {
        var outFilter = that.get('outFilter')

        // maybe destroyed
        if (!outFilter) {
          return
        }

        new Promise(function(resolve) {
          // 开放给外部处理
          if (outFilter.length === 2) {
            outFilter.call(that, data, resolve)
          } else {
            resolve(outFilter.call(that, data))
          }
        })
        .then(function(data) {
          // offset 溢出
          if (data.count && !data.items.length) {
            // 到最后一页
            that.getList({
              data: {
                $offset: (Math.ceil(data.count / params.$limit) - 1) * params.$limit
              }
            })
          } else {
            that.set('gridData', data)
          }
        })
      })
      .catch(function(error) {
        debug.error(error)
      })
  },

  deleteItem: function(id) {
    var item = this.getItemById(id),
      index, that = this,
      beDeleted,
      itemList = this.get('itemList'),
      mergeKey = this.get('mergeKey')

    // 动画
    item.fadeOut(function() {
      index = item.index()
      beDeleted = itemList[index]

      // 从 model 中移除
      itemList.splice(index, 1)
      // 页面还有数据
      if (itemList.length) {
        // 仅考虑 mergeKey 只有一个的情况
        if (mergeKey) {
          var mergeVal = beDeleted[mergeKey].value
          var mergeIndex = beDeleted[mergeKey].index
          itemList.forEach(function(item) {
            for (var key in item) {
              if (item.hasOwnProperty(key) && key === mergeKey && item[key].value === mergeVal) {
                item[key].count && item[key].count--
                if (item[key].index > mergeIndex) {
                  item[key].index--
                }
              }
            }
          })
          that.renderPartial(itemList)
        }
        // 从 DOM 中移除
        item.remove()
        that.trigger('deleteItemDone')
      } else {
        that.getList()
      }
    })
  },

  _onRenderGridData: function(gridData) {
    // 保存原始数据
    this.set('originData', gridData)

    // 拷贝一份数据给 filter
    gridData = $.extend(true, {}, gridData)

    var items = gridData.items,
      adapters = this.get('adapters'),
      uniqueId,
      entryKey,
      mergeKey,
      childKey,
      labelMap,
      visKeys,
      extKeys,
      allKeys,
      itemList = [0]

    function translateItems(items, level, parent) {
      if (!items || !items.length) {
        return
      }

      items.forEach(function(item, index) {
        var _item = {
          '__uniqueId': item[uniqueId]
        }

        var hasChild = childKey && item[childKey] && 1 || 0
        var hasParent = parent !== -1

        if (hasChild || hasParent) {
          _item['__child'] = hasChild
          _item['__index'] = hasParent ? [level, index].join('-') : ('' + index)
          _item['__level'] = '' + level
          _item['__parent'] = hasParent ? ('' + parent) : null
        }

        allKeys.forEach(function(key, index) {
          if (key === childKey) {
            return
          }

          _item[key] = {
            first: index === 0,
            last: index === visKeys.length - 1,
            key: key,
            value: item[key],
            label: labelMap[key],
            adapter: adapters(key, item[key], item),
            visible: visKeys.indexOf(key) !== -1,
            isEntry: key === entryKey,
            isMerge: key === mergeKey,
            count: item.count,
            index: item.index,
            item: item
          }
        })

        itemList.push(_item)

        if (hasChild) {
          translateItems(item[childKey], level + 1, _item['__index'])
        }
      })
    }

    // 强制无数据时列表刷新
    itemList.hacked = true

    if (items && items.length) {
      uniqueId = this.get('uniqueId')
      entryKey = this.get('entryKey')
      mergeKey = this.get('mergeKey')
      childKey = this.get('childKey')
      labelMap = this.get('labelMap')

      // keys that visible
      visKeys = Object.keys(labelMap)

      // keys that invisible
      extKeys = this.get('extKeys') || Object.keys(items[0]).filter(function(key) {
        return visKeys.indexOf(key) === -1
      })

      // sort keys by visibility
      allKeys = visKeys.concat(extKeys)

      itemList = []

      translateItems(items, 0, -1)

      delete itemList.hacked
    }

    this.set('itemList', itemList)
  },

  _onRenderItemList: function(itemList) {
    if (itemList.hacked) {
      // 重置
      itemList = []
      // 回设
      this.set('itemList', itemList, {
        silent: true
      })
    }

    this.renderPartial(itemList)
  },

  renderPartial: function(itemList) {
    this._renderPartial(itemList)
  },

  _renderPartial: function(itemList) {
    this.renderPartialTemplate('content', {
      childKey: this.get('childKey'),
      checkable: this.get('checkable'),
      // if check all
      checked: this.get('checked'),
      labelMap: this.get('labelMap'),
      itemActions: this.get('itemActions'),
      theme: this.get('theme'),
      itemList: itemList || this.get('itemList')
    })
  },

  addGridAction: function(options, fn, prepend) {
    var gridActions = this.get('gridActions')

    prepend ? gridActions.unshift(options) : gridActions.push(options)

    this._renderGridAction(gridActions)

    fn && this.delegateEvents('click [data-role="' + options.role + '"]', fn)
  },

  _renderGridAction: function(gridActions) {
    var that = this

    if (that._timeoutGridAction) {
      clearTimeout(that._timeoutGridAction)
    }

    that._timeoutGridAction = setTimeout(function() {
      that.renderPartialTemplate('header', {
        buttons: gridActions
      })
    }, 0)
  },

  addItemAction: function(options, index, fn) {
    var itemActions = this.get('itemActions')

    if (typeof index !== 'number') {
      itemActions.push(options)
    } else {
      itemActions.splice(index, 0, options)
    }

    fn && this.delegateEvents('click [data-role="' + options.role + '"]', fn)
  },

  getItems: function() {
    return this.$('[data-role="item"]')
  },

  getItemByTarget: function(target) {
    return this.$(target).closest('[data-role="item"]')
  },

  getItemById: function(id) {
    return this.$('[data-id="' + id + '"]')
  },

  getItemId: function(item) {
    return item.data('id')
  },

  getItemIdByTarget: function(target) {
    return this.getItemId(this.getItemByTarget(target))
  },

  getItemDataById: function(id, purify) {
    var data = this.get('itemList')[this.getItemById(id).index()]

    if (purify) {
      var _data = {}
      Object.keys(data).forEach(function(key) {
        if (key.charAt(0) !== '_' && key.charAt(1) !== '_') {
          _data[key] = data[key].value
        }
      })
      return _data
    }

    return data
  }

})

module.exports = Grid
