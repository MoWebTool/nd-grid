/**
 * @module: nd-grid
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-27 13:47:55
 */

'use strict';

var Form = require('nd-form');
var FD = require('nd-formdata');
var Queue = require('nd-queue');

module.exports = Form.extend({

  attrs: {
    // name: '',
    // action: '',
    // method: 'PUT',

    // 表单数据
    formData: {},

    dataParser: function() {
      return new FD(this.getElements()).toJSON();
    },

    // 数据相符校验，用于处理 formData 与 fields 匹配
    // matchers: {
      // test: function(value, match) {
      // return value === match[0].value;
      // }
    // },

    fields: [],

    buttons: [{
      label: '取消',
      type: 'button',
      role: 'form-cancel'
    }, {
      label: '提交',
      type: 'submit',
      role: 'form-submit'
    }],

    initProps: function() {
      this.queue = new Queue();
    }
  }

});
