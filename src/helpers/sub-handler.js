'use strict'

var __ = require('nd-i18n')
var Confirm = require('nd-confirm')

var noop = function() {}

module.exports = {
  handleChanged: function(sub) {
    if (sub && sub.instance && sub.instance.installCancel && sub.instance.triggerCancel) {
      window.onbeforeunload = function() {
        return __('还未保存，确定退出？')
      }

      var _ok
      var _no

      var _cancel = function(callback) {
        Confirm.show(__('还未保存，确定退出？'), function() {
          callback()
          _ok && _ok()
        }, function() {
          // set cancel again
          sub.instance.installCancel(_cancel)
          _no && _no()
        })

        return false
      }

      sub.instance.installCancel(_cancel)

      this.cancelSubView = function(ok, no) {
        _ok = ok
        _no = no
        sub.instance.triggerCancel()
        return true
      }
    } else {
      window.onbeforeunload = null
      this.cancelSubView = noop
    }
  },

  cancelSubView: noop
}
