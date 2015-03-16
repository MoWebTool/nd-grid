'use strict';

module.exports = {
  delCheck: {
    disabled: true,
    name: 'delCheck',
    plugin: require('./plugins/del-check'),
    // 依赖项
    dependencies: ['check']
  },
  viewItem: {
    disabled: true,
    name: 'viewItem',
    plugin: require('./plugins/view-item')
    // callbacks needed
  },
  editItem: {
    disabled: true,
    name: 'editItem',
    plugin: require('./plugins/edit-item')
    // callbacks needed
  },
  putItem: {
    disabled: true,
    name: 'putItem',
    plugin: require('./plugins/put-item')
    // callbacks needed
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
    // callbacks needed
  },
  check: {
    disabled: true,
    name: 'check',
    plugin: require('./plugins/check')
  },
  reload: {
    name: 'reload',
    plugin: require('./plugins/reload')
  },
  paginate: {
    // disabled: true,
    name: 'paginate',
    plugin: require('./plugins/paginate')
  },
  search: {
    disabled: true,
    name: 'search',
    plugin: require('./plugins/search')
  }
};
