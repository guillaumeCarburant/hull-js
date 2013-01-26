define ->

  init: (app)->
    return unless app.config.services.types.storage?.length > 0
    app.sandbox.data.storage_policy = app.config.services.settings.s3_storage



