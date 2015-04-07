'use strict';

module.exports = [
  {
    name: 'sort',
    disabled: true,
    starter: require('./plugins/sort')
  },
  {
    name: 'delCheck',
    disabled: true,
    starter: require('./plugins/del-check')
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
    name: 'reload',
    starter: require('./plugins/reload')
  },
  {
    name: 'paginate',
    // disabled: true,
    starter: require('./plugins/paginate')
  },
  {
    name: 'search',
    disabled: true,
    starter: require('./plugins/search')
  }
];
