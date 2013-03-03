/**
 * Widget Image Upload
 *
 * Thes widgets allows the user of your applications to attach documents and files to the application
 *
 * ### Dependencies
 *
 * * ```jquery.fileupload-ui```: This plugin uses [jQuery File upload plugin](https://github.com/blueimp/jQuery-File-Upload) to handle the file upload gracefully.
 *     Please note that the plugin is packaged within the widget so you don't have to struggle with the dependencies
 * * ``` storage```: This plugin requires that you have attahed an S3 storage to your Hull application in the admin.
 *
 * ### Templates
 *
 * * ```upload.hbs```: The main template. Because the jQuery plugin has some requirements, the template makes sure everything is set up as needed.
 * * ```upload_file_multiple```: Partial used to upload multiple files at once. Override this partial to ustomize the file upload to your needs
 * * ```upload_file_single```: Partial used to upload a single file. Override this partial to ustomize the file upload to your needs
 *
 * ### Parameters
 *
 * * ```data-hull-storage```: Specifies the storage engine to be used. If a single engine is known to the app, it will be automatically used. If there are many storage engines
 *    If there are many engines available, it must correspond to a value in ```sandbox.config.services.types.storage```.
 * ### Events
 *
 * * ```hull.upload.send```: Triggered when an upload has started.
 * * ```hull.upload.progress```: Triggered when an upload is in progress. The total amount of data as well as the current amount of data transfered are available as a listener parameter.
 * * ```hull.upload.done```: Triggered when an upload has finished. References to the uploadded files are available in an Array as the first parameter to the listeners.
 */
define(['jquery.fileupload-ui'], {

  type: "Hull",

  templates: [ 'upload', 'add_file', 'files', 'drop_zone', 'upload_file'],

  options:{
    maxNumberOfFiles : 1,
    maxFileSize      : 20000000,
    autoUpload       : false,
    dragAndDrop      : true,
    previewSize:     700
  },

  fileTypes: {
    images :  /(\.|\/)(gif|jpe?g|png)$/i
  },

  mimeTypes: {
    images: /^image\/(gif|jpeg|png)$/
  },

  fileProcessors: {
    images: [
      { action: 'load', fileTypes: /^image\/(gif|jpeg|png)$/, maxFileSize: 20000000 },
      { action: 'resize', maxWidth: 500, maxHeight: 500 },
      { action: 'save' }
    ]
  },

  uploader_events: [
    "fileuploadadd",
    "fileuploadadded",
    "fileuploadalways",
    "fileuploadchange",
    "fileuploadcompleted",
    "fileuploaddestroy",
    "fileuploaddestroyed",
    "fileuploaddone",
    "fileuploaddragover",
    "fileuploaddrop",
    "fileuploadfail",
    "fileuploadfailed",
    "fileuploadfinished",
    "fileuploadpaste",
    "fileuploadprogress",
    "fileuploadprogressall",
    "fileuploadsend",
    "fileuploadsent",
    "fileuploadstart",
    "fileuploadstarted",
    "fileuploadstop",
    "fileuploadstopped",
    "fileuploadsubmit"
  ],

  uploader_options: {
    dataType           : 'xml',
    minFileSize        : 0,
    dropZone           : 'dropzone',
    filesContainer     : 'files',
  },

  selectStoragePolicy: function () {
    var storagePolicies = [],
        selectedPolicy,
        optionValue = this.options.storage;
    if (this.sandbox.config.services.types.storage) {
      storagePolicies = this.sandbox.config.services.types.storage;
    }
    var countPolicies = storagePolicies.length;
    if (countPolicies === 1) {
      selectedPolicy = storagePolicies[0];
    } else if (countPolicies > 1) {
      if (!optionValue) {
        throw new TypeError("You must specify a storage policy.");
      }
      if (storagePolicies.hasOwnProperty(optionValue)) {
        selectedPolicy = storagePolicies[optionValue];
      } else {
        throw new TypeError("Unknown storage policy: ", optionValue);
      }
    } else {
      console.warn("No storage policy declared for the app. Unable to save the pictures.");
    }

    return this.sandbox.config.services.settings[selectedPolicy];
  },

  beforeRender: function (data) {
    // debugger
    this.options = _.defaults(this.uploader_options, this.options, {
      previewMaxWidth        : this.options.previewSize,
      previewMaxHeight       : this.options.previewSize,
      previewSourceFileTypes : this.mimeTypes.images,
      acceptFileTypes        : this.fileTypes.images,
      process                : this.fileProcessors.images,
      uploadTemplateId       : null,
      downloadTemplateId     : null,
      uploadTemplate         : this._templates.upload_file
    })
    data.upload_policy = this.selectStoragePolicy();
    data.options = this.options
    return data;
  },

  getContainer: function(container_name){
    return this.$el.find('[data-hull-container="'+container_name+'"]');
  },
  afterRender: function () {

    this.form = this.$el.find('form');
    this.dropzone = this.getContainer(this.options.dropZone);

    this.options = _.extend(this.options, {
      url                    : this.form.attr('action'),
      method                 : this.form.attr('method'),
      dropZone               : this.dropzone,
      filesContainer         : this.getContainer(this.options.filesContainer)
    });

    // Hide Dropzone if we're not enabling it.
    if(!this.options.dragAndDrop || !this.dropzone.length) {
      this.dropzone.remove();
      this.options.dropZone = null;
    }

    this.form.fileupload(this.options);
    this.uploader = this.form.data('fileupload');

    var emit = this.sandbox.emit, form = this.form;

    _.each(this.uploader_events, function(evt) {
      var n = evt.replace(/^fileupload/, '');
      form.on(evt, function(e,d) { emit('hull.upload.' + n, { event: e, data: d }); });
    });

    this.form.on('fileuploadadd',       this.onAdd);
    this.form.on('fileuploaddragover',  this.onDragOver);
    this.form.on('fileuploaddrop',      this.onDrop);
    this.form.on('fileuploadsend',      this.onSend);
    this.form.on('fileuploadsubmit',    this.onSubmit);
    this.form.on('fileuploadprogress',  this.onProgress);
    this.form.on('fileuploadfail',      this.onFail);
    this.form.on('fileuploadsuccess',   this.onSuccess);
    this.form.on('fileuploaddone',      this.onDone);

  },

  start: function () {
    this.form.fileupload('send', this.upload_data);
  },
  cancel: function () {},
  delete: function () {},

  onAdd: function (e, data) {
    var key = this.$el.find('[name="key"]');
    var s = key.val();
    key.val(s.replace('${filename}', "/" + data.files[0].name));
    this.$el.find('[name="Filename"]').val(data.files[0].name);
    this.$el.find('[name="name"]').val(data.files[0].name);
    this.$el.find('[name="Content-Type"]').val(data.files[0].type);
    return this.upload_data = data;
  },

  onDrop: function () {
    this.dropzone.find('b').text('Thanks !');
    this.dropzone.removeClass('dropzone');
  },

  onDragOver: function () {
    this.dropzone.addClass('dragover');
    clearTimeout(this.dragOverEffect);
    var self = this;
    this.dragOverEffect = setTimeout(function () { self.dropzone.removeClass('dragover'); }, 100);
  },

  onSend: function (e, data) {
    this.$el.find('.progress').fadeIn();
  },

  onSubmit: function (e, data) {
    this.toggleDescription();
  },

  toggleDescription: function () {
    var descriptionElt = this.$el.find("[name=description]");
    if (descriptionElt.is(':disabled')) {
      descriptionElt.removeAttr('disabled');
      descriptionElt.val('');
    } else {
      this.description = descriptionElt.val() || undefined;
      this.$el.find("[name=description]").attr('disabled', 'disabled');
    }
  },

  onProgress: function (e, data) {
    this.$el.find('.bar').css('width', data.percent + '%');
  },

  onFail: function (e, data) {
    this.$el.find('.error').text("Error :#{data.errorThrown}");
  },

  onDone: function (e, data) {
    this.$el.find('.progress').fadeOut(300, function () {});
    this.$el.find('.bar').css('width', 0);
    this.onUploadDone(data);
  },

  onUploadDone: function (data) {
    // var location = $(data.result).find('Location').text();
    // Context.app.addImage(filename: data.files[0].name)
    _.map(data.files, _.bind(function (file) {
      file.url = this.fileUrl(file.name);
      file.description = this.description;
    }, this));
    this.toggleDescription();
    this.uploader.options.maxNumberOfFiles++;
  },

  multipleUpload: function () {
    return false;
    // return (this.uploader.options.maxNumberOfFiles > 1);
  },

  fileUrl: function (filename) {
    var policy = this.selectStoragePolicy();
    return encodeURI(policy.url + policy.params.key.replace('${filename}', "/" + filename));
  },

  initialize: function () {
    _.bindAll(this);
      // /*
      //  * jQuery plugin adapter for CamanJS
      //  */
      // if (window.jQuery) {
      //   window.jQuery.fn.caman = function (callback) {
      //     return this.each(function () {
      //       Caman(this, callback);
      //     });
      //   };
      // }

      // var $input  = $('#input');
      // var $thumbs = $('#thumbs');
      // var $file_input = $('#file_input');
      // var $canvas = null;
      // var filters = ["vintage", "lomo", "clarity", "sinCity", "sunrise", "crossProcess", "orangePeel", "love", "grungy", "jarques", "pinhole", "oldBoot", "glowingSun", "hazyDays", "herMajesty", "nostalgia", "hemingway", "concentrate"];

      // var renderImage = function renderImage(source, filter){
      //   source.caman(function() {
      //     this.revert();
      //     this[filter]();
      //     this.render();
      //   });
      // }

      // var loadImage = function loadImage(canvas){
      //   $canvas = $(canvas);
      //   $input.empty().append($canvas);
      //   var $_thumbs = $('<div>').addClass('thumbs');
      //   for (var i = filters.length - 1; i >= 0; i--) {
      //     var f = filters[i]
      //     var c = document.createElement('canvas');
      //     c.width = c.height = 50;
      //     var ctx = c.getContext('2d');
      //     ctx.drawImage(canvas, 0, 0, 50, 50*canvas.height/canvas.width);
      //     var $c = $(c).addClass('thumb').addClass(f).data('filter',f);
      //     renderImage($c,f);
      //     $c.appendTo($_thumbs);
      //   };
      //   $thumbs.empty().append($_thumbs);
      // }

      // $thumbs.on('click','.thumb',function(e){
      //   var f = $(this).data('filter');
      //   renderImage($canvas, f);
      // })

      // $file_input.on('change', function(e){
      //   window.loadImage(e.target.files[0], loadImage, { maxWidth: 600, canvas:true, noRevoke:true });
      // });

  }
});
