/**
 *
 * This widget is identified as `identity@hull`
 * Use it to indicate whether the user is logged in or not, and display login buttons if not.
 *
 * ## Templates
 *
 * - `identity`: Displays login buttons or the name of the user, depending on its logged in state
 * 
 */

define({
  type: "Hull",
  
  templates: ['identity'],

  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    this.authServices = _.map(this.sandbox.config.services.types.auth, function(s) { return s.replace(/_app$/, ''); })
    if (_.isEmpty(this.authServices)) {
      console.error("No Auth services configured. please add one to be able to authenticate users.");
    }
  },

  beforeRender: function(data) {
    data.authServices = this.authServices || [];
    return data;
  }
});
