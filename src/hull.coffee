define ['components/aura-express/lib/aura'], (Aura)->

  hull = null

  myApp =
    name: 'Hull'
    afterAppStart: (app)->
      sb     = app.createSandbox()
      sb.me  = sb.data.api.model('me')
      sb.app = sb.data.api.model('app')
      sb.org = sb.data.api.model('org')
      window.Hull = sb;


  if window.opener && window.opener.Hull
    try
      window.opener.Hull.emit("hull.authComplete")
      return window.close()
    catch e
      console.warn("Error: " + e)

  (config, afterInit)->
    return hull if hull && hull.app
    config.namespace = "hull"
    hull = Aura(config)
    init = hull
      .use('aura-extensions/aura-handlebars')
      .use('aura-extensions/aura-backbone')
      .use('lib/client/handlebars-helpers')
      .use('lib/client/api')
      .use('lib/client/auth')
      .use('lib/client/storage')
      .use('lib/client/templates')
      .use('lib/client/widget')
      .use(myApp)
      .start({ widgets: 'body' })

    init.fail (err)-> throw err

    init.done(afterInit) if afterInit

    return hull


