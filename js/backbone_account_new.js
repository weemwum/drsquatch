var Scent = BBSafe.Model.extend({})
var Scents = BBSafe.Collection.extend({ model: Scent })

var TemplatedView = BBSafe.View.extend({
  template_id: '',
  initialize: function() {
    _.bindAll(this, 'render')
    this.model.on('change', this.render, this)
    this.$el.attr('class', $(this.template_id).attr('class'))
  },
  render: function() {
    this.$el.html(_.template($(this.template_id).html())(this.model.toJSON()))
  }
})

var ScentView = TemplatedView.extend({
  template_id: '#scent_template',
  events: {
    'click .qty-up': 'increaseQuantity',
    'click .qty-down': 'decreaseQuantity'
  },
  increaseQuantity: function(){
    //event.preventDefault();
    BBSafe.trigger('scent:qtyChange', this.model, 1)
    return false
  },
  decreaseQuantity: function(){
    //event.preventDefault();
    if (this.model.get('qty') != 0){
      BBSafe.trigger('scent:qtyChange', this.model, -1)
    }
    return false
  },
})

var ScentsView = BBSafe.View.extend({
  el: $('.scent-template-holder'),
  initialize: function(options){
    _.bindAll(this, 'render')
    this.scentViews = []
    _.each(this.model.models, function(scent){
      this.scentViews.push(new ScentView({
        model: scent
      }))
    }, this)

    this.numChoices = options.num_scent_choices

    this.model.on('change', this.render, this)
    this.listenTo(BBSafe, 'scent:qtyChange', this.updateScentQty)
    this.listenTo(BBSafe, 'form:submitClicked', this.submitForm)
  },
  render: function(){
    _.each(this.scentViews, function(scentView, i){
      scentView.render()
      this.$el.find('div.scent-edit-row:last').append(scentView.el)
    }, this)

    var $choice_holder = $('#total_scents')
    if ($choice_holder){
    	$choice_holder.text(this.numChoices)
    }
  },
  updateScentQty: function(scent, amount){
    var currentSelections = 0
    _.each(this.model.models, function(scent){
      currentSelections += scent.get('qty')
    })

    if (currentSelections + amount <= this.numChoices){
      scent.set('qty', scent.get('qty') + amount)
    }
  },
  getScentChoices: function(){
    var chosen = []
    _.each(this.model.models, function(scent){
      for(var i=0; i<scent.get('qty'); ++i){
        chosen.push( scent.get('sku') )
      }
    })

    return chosen
  },
  getChosenScentMetadata: function(){
    var key = 'scent_IDX_'
    var metadata = { 'survey': {} }
    var scentChoices = this.getScentChoices()
    for (var i=0;i<scentChoices.length; ++i){
      metadata.survey[key.replace('_IDX_', i+1)] = scentChoices[i]
    }
    return metadata
  },
  submitForm: function(sub_id){
    console.log('SUBMIT CLICKED')
    var metadata = this.getChosenScentMetadata()
    console.log(metadata)

    $.ajax({
      url: '/v1/store/api/subscriptions/' + sub_id + '/metadata/',
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify(metadata),
      success: function(data) {
        window.location = '/customer/account'
      }
    })
  }
})

var availableScents = availableScents || []



var num_scent_choices = num_scent_choices || 0

var scentsCollection = new Scents()

_.each(availableScents, function(scent){
  scentsCollection.add(scent)
})

var scentsView = new ScentsView({ model: scentsCollection, num_scent_choices: num_scent_choices })
scentsView.render()

