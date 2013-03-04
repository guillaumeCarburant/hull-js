/**
 * Widget Image Preview
 */
define({

  type: "Hull",
  templates: [ 'image'],
  filters  : ["vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel", "love", "grungy", "jarques", "pinhole", "oldBoot", "glowingSun", "hazyDays", "herMajesty", "nostalgia", "hemingway", "concentrate"],
  filter   : 'lomo',

  beforeRender: function (data) {
    return data;
  },

  afterRender: function () {

  },

  renderImage: function(source, filter){
    $(source).caman(function(e){
      this.revert();
      this[filter]();
      this.render();
    });
  },

  generateThumbs: function(canvas, container){
    var $_thumbs = $('<div>').addClass('thumbs');
    for (var i = this.filters.length - 1; i >= 0; i--) {
      var f = this.filters[i];
      var c = document.createElement('canvas');
      c.width = c.height = 50;
      c.getContext('2d').drawImage(canvas, 0, 0, 50, 50*canvas.height/canvas.width);
      var $c = $(c).addClass('thumb').addClass(f).data({
        'hull-action':'process',
        'hull-filter':f
      });
      $c.appendTo($_thumbs);
      this.renderImage(c, f);
    };
    return $_thumbs;
  },

  onUploadAdd: function(e){
    var filters = this.filters;
    var $thumbs = this.$el.find('[data-hull-container="thumbs"]');
    var $preview = this.$el.find('[data-hull-container="preview"]');

    loadImage(e.data.files[0], _.bind(function(canvas){
      this.canvas = canvas;
      // Generate Main preview
      this.renderImage(canvas,this.filter)
      // Add it to container
      $preview.append(canvas);

      // Generate Thumbs
      $_thumbs = this.generateThumbs(canvas, $thumbs);
      $thumbs.empty().append($_thumbs);
    },this), { maxWidth: 600, canvas:true, noRevoke:true });
  },

  initialize: function () {
    this.sandbox.on('hull.upload.add',         _.bind(this.onUploadAdd, this));

    if (window.jQuery) {
      window.jQuery.fn.caman = function (callback) {
        return this.each(function () {
          Caman(this, callback);
        });
      };
    }

    _.bindAll(this);
  },


  actions:{
    process:function(source, e, options){
      console.log('Process', arguments);
      this.renderImage(this.canvas,'sinCity')
    }
  }

});
