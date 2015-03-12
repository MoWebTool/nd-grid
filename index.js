/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var Widget = require('nd-widget');
var Template = require('nd-template');
var RESTful = require('nd-restful');

module.exports = Widget.extend({

  // 使用 handlebars
  Implements: [Template, RESTful],

  templateHelpers: {
    isEntryKey: function(entryKey, options) {
      return this.key === entryKey ? options.fn(this) : options.inverse(this);
    }
    // and isDisabled, adapters, from attrs
  },

  templatePartials: {
    table: require('./src/templates/table.handlebars'),
    action: require('./src/templates/action.handlebars')
  },

  attrs: {
    // 统一样式前缀
    classPrefix: 'ui-grid',

    // 模板
    template: require('./src/templates/grid.handlebars'),

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

    proxy: $.ajax,

    currentPage: 1,
    pageCount: 0,
    limit: 10,
    offset: 0,

    params: {},

    // url
    baseUri: null,
    // dataUrls: {},

    // 服务端返回的原始数据
    gridData: null,

    // 解析后的数据列表
    itemList: null,

    // 分页列表
    pageList: null,

    adapters: function(key, value) {
      return value;
    },

    isDisabled: function(itemData, options) {
      return this.disabled ? options.fn(this) : options.inverse(this);
    }
  },

  events: {
    'click [data-role=page-link]': function(e) {
      var pageText = e.currentTarget.getAttribute('data-page'),
        toPage;

      if (pageText === '+1') {
        toPage = this.get('currentPage') + 1;
      } else if (pageText === '-1') {
        toPage = this.get('currentPage') - 1;
      } else {
        toPage = +pageText;
      }

      this.gotoPage(toPage);
    }
  },

  setup: function() {
    this.initPlugins();

    this.templateHelpers.adapters = this.get('adapters');
    this.templateHelpers.isDisabled = this.get('isDisabled');

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

  gotoPage: function(page) {
    if (page < 1) {
      return;
    }

    if (page === this.get('currentPage')) {
      return;
    }

    if (page > this.get('pageCount')) {
      return;
    }

    this.getList({
      offset: (page - 1) * this.get('limit')
    });
  },

  getList: function(params) {
    var that = this;

    if (params) {
      this.set('params', params);
    }

    this.LIST($.extend({
        offset: this.get('offset'),
        limit: this.get('limit')
      }, this.get('params')))
      .done(function(data) {
        that.set('gridData', data);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  },

  _onRenderGridData: function(gridData) {
    this._parsePages(gridData);
    this._parseItems(gridData);
  },

  _onRenderItemList: function(itemList) {
    this.$('.content').html(this.templatePartials.table({
      uniqueId: this.get('uniqueId'),
      entryKey: this.get('entryKey'),
      baseUri: this.get('baseUri'),
      checkable: this.get('checkable'),
      labelMap: this.get('labelMap'),
      itemActions: this.get('itemActions'),
      itemList: itemList
    }, {
      helpers: this.templateHelpers
    }));
  },

  _onRenderPageList: function(pageList) {
    this.$('.header, .footer').html(this.templatePartials.action({
      gridActions: this.get('gridActions'),
      pageActions: this.get('pageActions'),
      pageList: pageList
    }, {
      helpers: this.templateHelpers
    }));
  },

  _parseItems: function(data) {
    var items = data.items,
      labelMap,
      uniqueId,
      itemList = [];

    if (items && items.length) {
      labelMap = this.get('labelMap');
      uniqueId = this.get('uniqueId');

      $.each(items, function(i, item) {
        // 仅取 labelMap 中定义的字段
        var _item = $.map(labelMap, function(value, key) {
          return {
            key: key,
            value: item[key]
          };
        });

        // 加设 uniqueId
        _item.uniqueId = item[uniqueId];

        itemList.push(_item);
      });

      this.set('itemList', itemList);
    }
  },

  _parsePages: function(data) {
    var pageList = [],
      limit = this.get('limit'),
      pageCount = Math.ceil(data.count / limit),
      currentPage = Math.floor(this.get('offset') / limit) + 1;

    if (pageCount) {
      pageList = [{
          page: '-1',
          text: '<',
          cls: 'prev',
          disabled: currentPage === 1
        },
        {
          page: currentPage,
          text: currentPage + '/' + pageCount,
          cls: 'current'
        },
        {
          page: '+1',
          text: '>',
          cls: 'next',
          disabled: currentPage === pageCount
        }];
    }

    this.set('pageCount', pageCount);
    this.set('currentPage', currentPage);

    this.set('pageList', pageList);
  }

});
