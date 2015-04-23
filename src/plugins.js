'use strict';

module.exports = [
  {
    name: 'search',
    disabled: true,
    starter: require('./plugins/search')
  },
  {
    name: 'delCheck',
    disabled: true,
    starter: require('./plugins/del-check')
  },
  {
    name: 'reload',
    starter: require('./plugins/reload')
  },
  {
    name: 'addItem',
    disabled: true,
    starter: require('./plugins/add-item')
  },
  {
    name: 'check',
    disabled: true,
    starter: require('./plugins/check')
  },
  {
    name: 'viewItem',
    disabled: true,
    starter: require('./plugins/view-item')
  },
  {
    name: 'editItem',
    disabled: true,
    starter: require('./plugins/edit-item')
  },
  {
    name: 'putItem',
    disabled: true,
    starter: require('./plugins/put-item')
  },
  {
    name: 'delItem',
    disabled: true,
    starter: require('./plugins/del-item')
  },
  {
    name: 'paginate',
    starter: require('./plugins/paginate')
  },
  {
    name: 'sort',
    disabled: true,
    starter: require('./plugins/sort')
  }
];
