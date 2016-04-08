/**
 * @module Grid
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')
var Widget = require('nd-widget')
var FD = require('nd-formdata')
var debug = require('nd-debug')

function getEventName(e) {
  return e.currentTarget
    .getAttribute('data-role')
    .replace(/\-([a-zA-Z])/g, function(_, $1) {
      return $1.toUpperCase()
    })
}

var Edit = Widget.extend({

  // 使用 handlebars
  Implements: [
    require('nd-template'),
    require('nd-queue')
  ],

  Plugins: [
    require('nd-select'),
    require('nd-calendar'),
    require('nd-validator')
  ],

  templatePartials: {
    buttons: require('./buttons.handlebars'),
    fields: require('./fields.handlebars'),
    attrs: require('./attrs.handlebars'),
    messages: require('./messages.handlebars'),
    options: require('./options.handlebars')
  },

  attrs: {
    classPrefix: 'ui-grid-edit',

    templateHelpers: {
      oneOf: require('./oneOf'),
      equal: require('./equal')
    },

    // element: null,
    // fields: [],
    method: 'PATCH',
    // formData: {},
    inFilter: function(data) {
      return data
    },
    outFilter: function(data) {
      return data
    },
    buttons: [{
      label: '提交',
      type: 'button',
      role: 'form-submit'
    }, {
      label: '取消',
      type: 'button',
      role: 'form-cancel'
    }],
    formCancel: function(callback) {
      var _formCancel = this._formCancel

      if (_formCancel) {
        // clean first
        delete this._formCancel

        _formCancel(callback)
        return false
      }

      return callback()
    },
    formSubmit: function(callback) {
      var form = this

      form.run(function() {
        callback(form.getData())
      })

      return false
    }
  },

  events: {
    // for attrs.buttons
    'click button[data-role]': function(e) {
      var form = this

      var name = getEventName(e)
      var wrap = form.get(name) || function(callback) {
        return callback()
      }
      var callback = function(data) {
        // on('formXXX')
        if (form.trigger(name, data) === false) {
          e.preventDefault()
        }
        // if return false here, wrap will return false, the PD
      }

      // attrs.formXxx
      if (wrap.call(form, callback) === false) {
        e.preventDefault()
      }
    }
  },

  initAttrs: function(config) {
    config.element = config.parentNode
    delete config.parentNode

    Edit.superclass.initAttrs.call(this, config)
  },

  setup: function() {
    // this.element.addClass('ui-grid-edit-inline')
    this.get('fields').forEach(function(field) {
      if (field.editable) {
        this._addField(field)
      }
    }, this)

    this.addButtons(this.get('buttons'))

    // this.getPlugin('Select').setOptions('config', {
    //   style: {
    //     'min-width': '100%'
    //   }
    // })

    this.getPlugin('Validator').on('export', function(validator) {
      validator.on('itemValidated', function(err, message/*, element, event*/) {
        if (err) {
          debug.error(message)
        }
      })
    })

    this.before('destroy', function() {
      // 移除按钮
      this.$('.ui-grid-edit-buttons').remove()
      // 移除表单项
      this.getElements().forEach(function(elem) {
        $(elem.parentNode).remove()
      })
      // make sure
      this.$('.ui-grid-edit-field').remove()
      // 重置样式
      // this.element.removeClass('ui-grid-edit-inline')
    })
  },

  addButtons: function(buttons) {
    var templateOptions = this._getTemplateOptions()
    var tempaltePartial = templateOptions.partials.buttons

    if (tempaltePartial) {
      this.$('[data-partial="buttons"]').prepend(
        tempaltePartial.call(this, {
          classPrefix: this.get('classPrefix'),
          buttons: buttons
        }, templateOptions)
      )
    }
  },

  _addField: function(field) {
    var templateOptions = this._getTemplateOptions()
    var tempaltePartial = templateOptions.partials.fields

    var model

    if (tempaltePartial) {
      model = {
        attrs: {
          'data-display': field.label
        }
      }
      $.extend(true, model, field, {
        classPrefix: this.get('classPrefix'),
        value: this.get('formData')[field.name]
      })
      if (model.options) {
        model.options.forEach(function(option) {
          option.selected = option.checked = option.value === model.value
        })
      }
      this.$('[data-name="' + field.name + '"]').before(
        tempaltePartial.call(this, model, templateOptions)
      )
    }
  },

  // for grid
  installCancel: function(callback) {
    if (callback) {
      this._formCancel = callback
    } else {
      delete this._formCancel
    }
  },

  // for grid
  triggerCancel: function() {
    this.$('[data-role="form-cancel"]').trigger('click')
  },

  // 获取实时字段值
  getData: function() {
    return this.get('outFilter').call(this, new FD(this.getElements()).toJSON())
  },

  // 设置字段值
  setData: function(data) {
    data = this.get('inFilter').call(this, data)
    Object.keys(data).forEach(function(name) {
      this.getField(name).val(data[name]).trigger('change')
    }, this)
  },

  getElements: function() {
    var elements = []
    this.$('[name]').each(function(i, elem) {
      if (elem.name !== 'check-item') {
        elements.push(elem)
      }
    })
    return elements
  },

  getField: function(name) {
    return this.$('[name="' + name + '"]')
  },

  getValue: function(name) {
    var field = this.getField(name)

    if (!field.length) {
      return
    }

    if (field.length === 1) {
      return field.val()
    }

    var value = []

    field.each(function(i, item) {
      if (!/^(?:radio|checkbox)$/.test(item.type) || item.checked) {
        value.push(item.value)
      }
    })

    return value
  }

})

module.exports = Edit
