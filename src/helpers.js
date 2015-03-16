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
    place = '[data-role="header"]';
  } else {
    if (place === 'both') {
      place = '[data-role="header"],[data-role="footer"]';
    } else {
      place = '[data-role="' + place + '"]';
    }
  }

  return place;
};
