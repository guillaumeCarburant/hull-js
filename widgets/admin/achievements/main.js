define({
  type: 'Hull',
  templates: ['main'],
  datasources: {
    achievements: 'app/achievements'
  },

  afterRender: function () {
    var that = this;
    $('form', this.el).on('submit', function (evt) {
      evt.preventDefault();
      var data = that._getFormData(this);
      that.createAchievement(data);
    });
  },

  createAchievement: function (data) {
    var promise = this.api.post('app/achievements', data);
    this._attachHandlers(promise);
  },

  deleteAchievement: function (data) {
    var promise = this.api.delete(data.data.achievementId)
    this._attachHandlers(promise);
  },

  actions: {
    remove: function (evt, data) {
      this.deleteAchievement(data);
    }
  },

  _getFormData: function (elt) {
    var data = {};
    _.each($(elt).serializeArray(), function (entry) {
      if (!entry.value) return;
      data[entry.name] = entry.value;
    });
    return data;
  },

  _attachHandlers: function (promise) {
    var that = this;
    promise.then(function () {
      that.refresh();
    }, function () {
      that.render('main', {error: true});
    });
  }
});