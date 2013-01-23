define ['components/aura-express/lib/aura'], (Aura)->

  hull = null

  myApp =
    name: 'Hull'
    afterAppStart: (app)->
      sb = app.createSandbox();
      window.Hull = sb;
      Hull.me     = sb.data.api.model('me');
      Hull.app    = sb.data.api.model('app');
      Hull.org    = sb.data.api.model('org');


  if window.opener && window.opener.Hull
    try
      window.opener.Hull.emit("hull.authComplete")
      return window.close()
    catch e
      console.warn("Error: " + e)

  (config, afterInit)->
    return hull if hull && hull.app
    hull = { config }
    config.namespace = "hull"
    hull.app = Aura(config)
    console.warn("Init aura with config: ", config);
    initProcess = hull.app
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

    initProcess.fail (err)-> throw err

    initProcess.done(afterInit)

    return hull


