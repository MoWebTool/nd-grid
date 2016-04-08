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

    adapters: function(name, value) {
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
      items: Object.keys(labelMap).map(function(name) {
        return {
          name: name,
          label: labelMap[name],
          value: adapters(name, valueMap[name])
        }
      })
    })
  },

  getItem: function(name) {
    return this.$('[data-name="' + name + '"]')
  },

  getValue: function(name) {
    return this.get('valueMap')[name]
  },

  setValue: function(name, value) {
    this.getItem(name).find('.value').html(value)
  }

})

module.exports = View
