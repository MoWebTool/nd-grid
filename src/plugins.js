'use strict';

module.exports = {
  delCheck: {
    disabled: true,
    plugin: require('./plugins/del-check'),
    // 依赖项
    dependencies: ['check']
  },
  viewItem: {
    disabled: true,
    plugin: require('./plugins/view-item')
    // callbacks needed
  },
  editItem: {
    disabled: true,
    plugin: require('./plugins/edit-item')
    // callbacks needed
  },
  putItem: {
    disabled: true,
    plugin: require('./plugins/put-item')
    // callbacks needed
  },
  delItem: {
    disabled: true,
    plugin: require('./plugins/del-item')
  },
  addItem: {
    disabled: true,
    plugin: require('./plugins/add-item')
    // callbacks needed
  },
  check: {
    disabled: true,
    plugin: require('./plugins/check')
  },
  reload: {
    plugin: require('./plugins/reload')
  },
  paginate: {
    // disabled: true,
    plugin: require('./plugins/paginate')
  },
  search: {
    disabled: true,
    plugin: require('./plugins/search')
  }
};
