/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
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
    // and adapters, from attrs
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

    checkable: false,

    plugins: require('./src/plugins'),

    proxy: $.ajax,

    currentPage: 1,
    pageCount: 0,
    limit: 10,
    offset: 0,

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

    this.templateHelpers.adapters = this.get('adapters');

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

    this.LIST($.extend({
        offset: this.get('offset'),
        limit: this.get('limit')
      }, params))
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
      itemList;

    if (items && items.length) {
      labelMap = this.get('labelMap');

      itemList = $.map(items, function(item) {
        var _item = {};

        // 仅取 labelMap 定义的字段
        $.each(labelMap, function(key) {
          _item[key] = item[key];
        });

        return _item;
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
