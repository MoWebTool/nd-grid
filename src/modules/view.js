/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var Widget = require('nd-widget')
var Template = require('nd-template')

var View = Widget.extend({

  Implements: [Template],

  attrs: {
    classPrefix: 'ui-grid-view',

    template: require('./view.handlebars'),

    labelMap: {},
    valueMap: {},

    inFilter: function(value) {
      return value
    },

    adapters: function(key, value) {
      return value
    }
  },

  initAttrs: function(config) {
    View.superclass.initAttrs.call(this, config)

    var inFilter = this.get('inFilter')
    var adapters = this.get('adapters')
    var labelMap = this.get('labelMap')
    var valueMap = inFilter(this.get('valueMap'))

    this.set('model', {
      hasBack: this.get('hasBack'),
      items: Object.keys(labelMap).map(function(key) {
        return {
          key: key,
          label: labelMap[key],
          value: adapters(key, valueMap[key])
        }
      })
    })
  },

  getItem: function(key) {
    return this.$('[data-key="' + key + '"]')
  },

  getValue: function(key) {
    return this.get('valueMap')[key]
  },

  setValue: function(key, value) {
    this.getItem(key).find('.value').html(value)
  }

})

module.exports = View
