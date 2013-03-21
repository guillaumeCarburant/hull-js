/**
 * # Comments
 *
 * Allow to list and add comments on an object of the current application.
 *
 * ## Option:
 *
 * - `id`: The object you want to manipulate comments upon.
 *
 * ## Template:
 *
 * - `comments`: Display a list of comments and a form that allows logged users
 *   to post new comments.
 *
 * ## Datasource:
 *
 * - `comments`: Collection of all the comments related to the object.
 *
 * ## Action:
 *
 * - `comment`: Submits a new comment.
 */
define({
  type: 'Hull',

  templates:  ['comments'],

  initialize: function () {
    this.sandbox.on('collection.hull.' + this.id + '.comments.**', function() {
      this.refresh();
    }.bind(this));
  },

  //@FIX Cache is broken for datasources declared as objects
  datasources: {
    comments: ':id/comments'
  },

  actions: {
    comment: function (elt, evt, data) {
      var description = this.$el.find('textarea').val();
      if (description && description.length > 0) {
        var comment = this.data.comments.create({
          description: description
        });
      }
    }
  }
});
