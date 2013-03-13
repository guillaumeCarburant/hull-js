/*global define mocha */
var should;

require.config({
  baseUrl: '../',
  paths: {
    components:   'components',
    widgets:      'spec/widgets',
    aura:         'components/aura/lib',
    chai:         'node_modules/chai/chai',
    sinonChai:    'node_modules/sinon-chai/lib/sinon-chai',
    fixtures:     'spec/fixtures',
    underscore:   'components/underscore/underscore-min'
  }
});

define(['chai', 'sinonChai'], function (chai, sinonChai) {
  window.chai = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;
  window.should = chai.should();
  window.sinonChai = sinonChai;
  window.notrack = true;

  chai.use(sinonChai);
  mocha.setup('bdd');
  mocha.globals(['Backbone', 'easyXDM', 'Handlebars', 'handlebars', 'Hull', 'errorProps']);

  require([
    // 'spec/lib/extensions/templates_spec',
    // 'spec/client/api_spec',
    // 'spec/lib/hullbase_spec',
    // 'spec/lib/hull_spec',
    // 'spec/client/datasource_spec',
    // 'spec/client/widget_spec'
  ], function () {
    mocha.run();
  });
});
