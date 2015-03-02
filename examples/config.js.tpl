(function(window, seajs, undefined) {

  'use strict';

  if (!seajs) {
    return;
  }

  // debug 开关
  var debug = window.location.search.indexOf('debug') > 0;

  // base
  var base = '@BASE';

  // 映射表
  var map = [];

  seajs.config({
    base: base,
    alias: {
      //@ALIAS
    },
    map: map,
    debug: debug
  });

})(this, this.seajs);
