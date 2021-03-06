/**
 * ## Conversation Default
 * This component will default to load the first conversation that comes back for the subject. 
 * If none returns, it will create a default conversation for you.
 *
 * ## Example
 *
 *     <div data-hull-component="conversations/default@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
 *
 * - `id` or `uid`: Required, The converation subject identifier
 *
 * ## Template:
 *
 * - `default`: Renders a conversation component
 *
 * ## Datasource:
 *
 * - `conversations`: List of conversations
 *
 */

/*global define:true, _:true */
Hull.component('default', {
  templates: ['default'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
  },

  options: {
    focus: false
  },

  datasources: {
    conversations: function () {
      return this.api(this.id + '/conversations');
    }
  },

  beforeRender: function(data){
    "use strict";
    // Use the first conversation that comes back
    if(data.conversations.length > 0) {
      data.conversationId = data.conversations[0].id;
    }
    else {
      // Or create a new conversation by default
      var attrs = {
        name: this.options.conversationName,
        description: this.options.description
      }
      this.api(this.id + '/conversations', 'post', attrs).then(_.bind(function(convo) {
        self.conversationId = convo.id;
        this.render();
      }, this));
    }
    return data;
  }
});
