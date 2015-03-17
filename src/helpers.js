'use strict';

exports.makeButton = function(options) {
  return '<button' +
    // className
    ' class="button-' + options.role + '"' +
    // role
    ' data-role="' + options.role + '"' +
    // disabled
    (options.disabled ? ' disabled' : '') +
    '>' + options.text + '</button>';
};

exports.makePlace = function(options) {
  var place;

  if (options) {
    if ((place = options.place)) {
      delete options.place;
    }
  }

  // 位置
  if (!place) {
    return '[data-role="header"]';
  } else {
    if (place === 'both') {
      return '[data-role="header"],[data-role="footer"]';
    } else {
      return '[data-role="' + place + '"]';
    }
  }
};
