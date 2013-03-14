/**
 * This widget allows you to display a list of sharing services.
 *
 * ## Parameters
 *
 * - `label`: The label of the sharing link
 * - `text`: Default sharing text
 * - `url`: URL of the page to share
 *
 */
define({
  type: 'Hull',

  templates: ['twitter'],

  beforeRender: function(data) {
    if (this.options.provider) { this.template = this.options.provider; }

    data.label = this.options.label;
    data.text = encodeURIComponent(this.options.text);
    data.url = encodeURIComponent(this.options.url);
  }
});
