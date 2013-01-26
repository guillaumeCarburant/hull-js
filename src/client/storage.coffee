define ->

  require:
    paths:
      'jquery.fileupload' : 'components/jquery-file-upload/js/jquery.fileupload'
      'jquery.ui.widget'  : 'components/jquery-file-upload/js/vendor/jquery.ui.widget'

  init: (app)->
    return unless app.config.services.types.storage?.length > 0
    app.sandbox.data.storage_policy = app.config.services.settings.s3_storage



