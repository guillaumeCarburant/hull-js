define({
  type: "Hull",
  templates: ['identity'],
  beforeRender: function(data) {
    data.authServices = _.map(this.sandbox.services.types.auth || [], function(s) {
      return s.replace(/_app$/, '');
    });
    return data;
  }
});
