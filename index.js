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
      isDisabled: function(itemData, options) {
        var disabled = this.disabled

        if (typeof disabled === 'function') {
          disabled = disabled(itemData)
        }

        return (disabled === true ||
          // 整行禁止
          (itemData.disabled && (itemData.disabled === true || itemData.disabled.value === true))) ?
          options.fn(this) : options.inverse(this)
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
    mergeKey: {
      value: null,
      setter: function() {
        throw new Error('不再支持 mergeKey 参数')
      }
    },
    uniqueId: 'id',
    entryKey: {
      getter: function(value) {
        return (typeof value === 'undefined') ? this.get('uniqueId') : value
      }
    },
    // 多级嵌套
    childKey: null,
    labelMap: {
      value: {},
      setter: function() {
        throw new Error('不再支持 labelMap 参数，请使用 columns')
      }
    },

    columns: [],

    checkable: false,

    // for change item's checkbox's disabled property
    checkboxDisabled: null,

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
    adapters: {
      value: null,
      setter: function() {
        throw new Error('不再支持 adapters 参数，请直接在 columns 中设置 filters')
      }
    },

    filters: require('./src/helpers/filters'),

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
    var pluginCfg = this.get('pluginCfg')

    pluginCfg.check.disabled = !checkable
    if (!checkable) {
      pluginCfg.delCheck.disabled = true
    }

    pluginCfg.sort.disabled = !this.get('columns').some(function(column){ return !!column.sortable })

    pluginCfg.viewItem.disabled = !this.get('entryKey')
    pluginCfg.paginate.disabled = (this.get('mode') === 2)

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

    // 处理嵌套
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

    // 处理字段
    var columns = this.get('columns')
    var columnMap = {}
    var allNames = columns.map(function(column) {
      columnMap[column.name] = column
      return column.name
    })
    var visableNames = allNames.filter(function(name) {
      return columnMap[name].visible
    })
    this.set('allNames', allNames)
    this.set('columnMap', columnMap)
    this.set('visableNames', visableNames)
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
      .catch(debug.error)
  },

  deleteItem: function(id) {
    var item = this.getItemById(id),
      index, that = this,
      itemList = this.get('itemList')

    // 动画
    item.fadeOut(function() {
      index = item.index()

      // 从 model 中移除
      itemList.splice(index, 1)
      // 页面还有数据
      if (itemList.length) {
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
      uniqueId,
      entryKey,
      childKey,
      columnMap,
      filters,
      filterMap = {},
      allNames,
      visableNames,
      itemList = [0],
      checkboxDisabled

    function getFiltersByNames(names) {
      if (typeof names === 'string') {
        names = names.split(/\s*\|\s*/)
      }
      var fs = []
      names.forEach(function(name) {
        if (typeof name === 'function') {
          fs.push(name)
        } else if (filters.hasOwnProperty(name)) {
          fs.push(filters[name])
        }
      })
      return fs
    }

    function getFiltersByName(name) {
      if (!filterMap[name]) {
        var column = columnMap[name]

        // 寻找类型与名称对应的过滤器
        var names = [column.type, name]

        // 数据结构里特殊指定的过滤器
        if (column.filters) {
          names = names.concat(column.filters)
        }

        filterMap[name] = getFiltersByNames(names)
      }
      return filterMap[name]
    }

    function applyFilters(value, name, item) {
      var fs = getFiltersByName(name)

      if (fs.length) {
        value = fs.reduce(function(value, f) {
          return f(value, name, item)
        }, value)
      }

      // 引入多语言
      return __(value)
    }

    function translateItems(items, level, parent) {
      if (!items || !items.length) {
        return
      }

      items.forEach(function(item, index) {
        var _item = {
          '__uniqueId': item[uniqueId],
          checkboxDisabled: typeof checkboxDisabled === 'function' || typeof checkboxDisabled === 'boolean' ? checkboxDisabled(item) : false
        }

        // 处理嵌套
        var hasChild = childKey && item[childKey] && 1 || 0
        var hasParent = parent !== -1

        if (hasChild || hasParent) {
          _item['__child'] = hasChild
          _item['__index'] = hasParent ? [level, index].join('-') : ('' + index)
          _item['__level'] = '' + level
          _item['__parent'] = hasParent ? ('' + parent) : null
        }

        // 处理 cells
        allNames.forEach(function(name) {
          // 跳过嵌套
          if (name === childKey) {
            return
          }

          _item[name] = $.extend({}, columnMap[name], {
            first: name === visableNames[0],
            value: item[name],
            adapted: applyFilters(item[name], name, item),
            isEntry: name === entryKey,
            item: item
          })
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
      childKey = this.get('childKey')
      columnMap = this.get('columnMap')
      filters = this.get('filters')
      allNames = this.get('allNames')
      visableNames = this.get('visableNames')
      checkboxDisabled = this.get('checkboxDisabled')

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
      columns: this.get('columns'),
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
  },

  getEditableColumns: function() {
    return $.extend(true, [], this.get('columns').filter(function(column) {
      // 现在只要有 group 就是可编辑
      return !!column.group || column.editable
    }))
  }

})

module.exports = Grid
