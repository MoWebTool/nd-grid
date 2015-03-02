/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Widget = require('nd-widget');
var Template = require('nd-template');
var Plugins = require('nd-plugins');
var RESTful = require('nd-restful');

module.exports = Widget.extend({

  // 使用 handlebars
  Implements: [Template, Plugins, RESTful],

  templateHelpers: {
    uniqueId: function(uniqueId) {
      return this[uniqueId];
    },
    isEquals: function(key, uniqueId, options) {
      return key === uniqueId ? options.fn(this) : options.inverse(this);
    }
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

    // 数据源名
    scope: 'grid',

    // 行处理
    itemActions: [],

    // 全局处理
    gridActions: [],

    // 分页处按钮
    pageActions: [],

    // 数据
    model: {},

    checkable: false,

    plugins: require('./src/plugins'),

    proxy: $.ajax,

    currentPage: 1,
    pageCount: 0,

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

    // 取列表
    this.getList();
  },

  initPlugins: function() {
    var that = this,
      plugins = this.get('plugins');

    // checkboxes
    plugins.check.disabled = !this.get('checkable');

    // delCheck's dependencies
    if (!plugins.delCheck.disabled) {
      $.each(plugins.delCheck.dependencies, function(i, item) {
        plugins[item].disabled = false;
      });
    }

    // boot
    $.each(plugins, function(i, item) {
      if (!item.disabled) {
        that.addPlugin(item.name, item.plugin, item.callback);
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
      offset: (page - 1) * this.get('pageSize')
    });
  },

  getList: function(params) {
    var that = this,
      gridData;

    if (!params) {
      gridData = this.get('gridData');

      if (gridData) {
        params = {
          offset: gridData.offset
        };
      }
    }

    this.LIST(params)
      .done(function(data) {
        that.set('gridData', data);
      })
      .fail(function(xhr, statusText, error) {
        that.trigger('fail', xhr, statusText, error);
      })
      .always(function() {
      });
  },

  _onRenderGridData: function(gridData) {
    this._parsePages(gridData);
    this._parseItems(gridData);
  },

  _onRenderItemList: function(itemList) {
    this.$('.content').html(this.templatePartials.table({
      uniqueId: this.get('uniqueId'),
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
      adapters,
      itemList;

    if (items && items.length) {
      labelMap = this.get('labelMap');
      adapters = this.get('adapters');

      itemList = $.map(items, function(item) {
        var _item = {};

        // 仅取 labelMap 定义的字段
        $.each(labelMap, function(key) {
          _item[key] = adapters(key, item[key]);
        });

        return _item;
      });

      this.set('itemList', itemList);
    }
  },

  _parsePages: function(data) {
    var pageList = [{
          page: '-1',
          text: '<',
          cls: 'prev'
        },
        {
          cls: 'current'
        },
        {
          page: '+1',
          text: '>',
          cls: 'next'
        }],
      pageCount = Math.ceil(data.count / data.limit),
      currentPage = Math.floor(data.offset / data.limit) + 1;

    pageList[0].disabled = currentPage === 1;
    pageList[1].page = currentPage;
    pageList[1].text = currentPage + '/' + pageCount;
    pageList[2].disabled = currentPage === pageCount;

    this.set('pageSize', data.limit);
    this.set('pageCount', pageCount);
    this.set('currentPage', currentPage);

    this.set('pageList', pageList);
  }

});
