'use strict';

module.exports = {
  viewItem: {
    disabled: true,
    name: 'viewItem',
    plugin: require('./plugins/view-item')
    // callback needed
  },
  editItem: {
    disabled: true,
    name: 'editItem',
    plugin: require('./plugins/edit-item')
    // callback needed
  },
  putItem: {
    disabled: true,
    name: 'putItem',
    plugin: require('./plugins/put-item')
    // callback needed
  },
  delItem: {
    disabled: true,
    name: 'delItem',
    plugin: require('./plugins/del-item')
  },
  addItem: {
    disabled: true,
    name: 'addItem',
    plugin: require('./plugins/add-item')
    // callback needed
  },
  check: {
    disabled: true,
    name: 'check',
    plugin: require('./plugins/check')
  },
  delCheck: {
    disabled: true,
    name: 'delCheck',
    plugin: require('./plugins/del-check'),
    // 依赖项
    dependencies: ['check']
  },
  reload: {
    name: 'reload',
    plugin: require('./plugins/reload')
  },
  search: {
    disabled: true,
    name: 'search',
    plugin: require('./plugins/search')
  }
};
