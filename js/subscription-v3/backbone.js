/* global BBSafe, $, jQuerySafe, _ */
/* eslint indent: ["error", 2], quotes: ["error", "single"], semi: ["error", "never"] */

var availableQuantities = availableQuantities || []
var availableTerms = availableTerms || []
var availableScents = availableScents || []
var availableAddons = availableAddons || []
var availableProducts = availableProducts || []

var SubscribeModel = BBSafe.Model.extend({})
var Quantity = BBSafe.Model.extend({})
var Term = BBSafe.Model.extend({})

var Scent = BBSafe.Model.extend({
  initialize: function() {
    this.listenTo(BBSafe, 'quantity:toSelect', this.updateQuantity)
  },
  updateQuantity: function(options) {
    this.numToSelect = options.numChoices
    this.numSelected = options.numSelected
  },
  increaseQuantity: function() {
    this.canAdd = true
    if (this.numSelected >= this.numToSelect) {
      this.canAdd = false
    }
    if (this.canAdd) {
      this.set('qty', this.get('qty') + 1)
    }
  },
  decreaseQuantity: function() {
    if (this.get('qty') !== 0) {
      this.set('qty', this.get('qty') - 1)
      this.canAdd = true
    }
  }
})

var Addon = BBSafe.Model.extend({
  increaseQuantity: function() {
    this.set('qty', this.get('qty') + 1)
    BBSafe.trigger('addon:quantityChanged')
  },
  decreaseQuantity: function() {
    if (this.get('qty') !== 0) {
      this.set('qty', this.get('qty') - 1)
    }
    BBSafe.trigger('addon:quantityChanged')
  }
})

var GrandTotal = BBSafe.Model.extend({})

var Quantities = BBSafe.Collection.extend({ model: Quantity })
var Terms = BBSafe.Collection.extend({ model: Term })
var Scents = BBSafe.Collection.extend({ model: Scent })
var Addons = BBSafe.Collection.extend({ model: Addon })

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

/////////////////////
////QUANTITY VIEWS///
/////////////////////
var QuantityView = TemplatedView.extend({
  events: {
    'click .btn-product-select': 'quantitySelected'
  },
  template_id: '#product_template',
  quantitySelected: function(event) {
    event.preventDefault()
    this.model.set('selected', true)
    BBSafe.trigger('quantity:selectionChanged', this.model)
  }
})
var QuantitiesView = BBSafe.View.extend({
  el: $('.product-template-holder'),
  initialize: function() {
    _.bindAll(this, 'render')
    this.quantityViews = []
    _.each(this.model.models, function(quantity) {
      this.quantityViews.push(new QuantityView({
        model: quantity
      }))
    }, this)

    this.listenTo(BBSafe, 'quantity:selectionChanged', this.quantitySelectionChanged)

  },
  render: function() {
    _.each(this.quantityViews, function(quantityView) {
      quantityView.render()
      this.$el.append(quantityView.el)
    }, this)
  },
  quantitySelectionChanged: function(selectedQuantity) {
    _.each(this.quantityViews, function(quantityView) {
      quantityView.model.set('selected', quantityView.model == selectedQuantity)
    }, this)
  }
})

/////////////////////
///   TERM VIEWS  ///
/////////////////////
var TermView = TemplatedView.extend({
  events: {
    'click .btn-term-select': 'termSelected'
  },
  template_id: '#term_template',
  termSelected: function(event) {
    event.preventDefault()
    this.model.set('selected', true)
    BBSafe.trigger('term:selectionChanged', this.model.get('term_type'))
  }
})

var TermsView = BBSafe.View.extend({
  el: $('.term-template-holder'),
  initialize: function() {
    _.bindAll(this, 'render')
    this.termViews = []
    _.each(this.model.models, function(term) {
      this.termViews.push(new TermView({
        model: term
      }))
    }, this)

    this.listenTo(BBSafe, 'term:selectionChanged', this.termSelectionChanged)
  },
  render: function() {
        // console.log("In render of terms view");
    _.each(this.termViews, function(termView) {
      termView.render()
      this.$el.append(termView.el)
    }, this)
        // console.log("Done with render on terms view");
  },
  termSelectionChanged: function(term_type) {
    _.each(this.termViews, function(termView) {
      if (termView.model.get('term_type') != term_type) {
        termView.model.set('selected', false)
      }
    }, this)
  }
})

/////////////////////
///  SCENT VIEWS  ///
/////////////////////
var ScentOptionView = TemplatedView.extend({
  template_id: '#scent_option_template'
})

var ScentView = TemplatedView.extend({
  template_id: '#scent_template',
  events: {
    'click .qty-up': 'increaseQuantity',
    'click .qty-down': 'decreaseQuantity'
  },
  increaseQuantity: function(event) {
    event.preventDefault()
    this.model.increaseQuantity()
  },
  decreaseQuantity: function(event) {
    event.preventDefault()
    this.model.decreaseQuantity()
  }
})

var ScentsView = BBSafe.View.extend({
  el: $('.scent-template-holder'),
  initialize: function() {
    _.bindAll(this, 'render')
    this.collection.on('add', this.render)
  },
  addScent: function(scent) {
    var scentView = new ScentView({ model: scent })
    var scentId = 'scent-' + scent.id
    scentView.render()
    scentView.el.id = scentId
    scentView.el.setAttribute('data-group', 'scents')
    this.$el.append(scentView.el)

    var optionView = new ScentOptionView({ model: scent })
    optionView.render()
    optionView.el.setAttribute('data-target', '#' + scentId)
    $('.scent-options-template-holder').append(optionView.el)
  },
  getScentChoices: function() {
    var chosen = this.collection.filter(function(scent) {
      return scent.get('qty') > 0
    })
    return chosen
  },
  render: function() {
    this.collection.forEach(this.addScent, this)
  }
})

/////////////////////
/// SCENT VIEWS #2///
///(CHOSEN SCENTS)///
/////////////////////

var ChosenScentView = BBSafe.View.extend({

  template: _.template($('#chosen_scent_template').html()),
  events: {
    'click .remove': 'removeScent'
  },
  initialize: function() {
    _.bindAll(this, 'render')
    this.model.on('change', this.render, this)
  },
  removeScent: function() {
    this.model.decreaseQuantity()
  },
  render: function() {
    var data = this.model.toJSON()
    this.$el.html(this.template(data))
    return this
  }
})

var ChosenScentsView = BBSafe.View.extend({
  el: $('.chosen-scent-template-holder'),
  initialize: function() {
    _.bindAll(this, 'render')
    this.collection.on('change', this.render)
  },
  addScent: function(scent) {
    var chosenScentView = new ChosenScentView({ model: scent })
    this.$el.append(chosenScentView.render().el)
  },
  checkQty: function() {
    var getScentSelected = this.collection.map(function(scent) {
      return scent.get('qty')
    })
    var totalScentSelected = _.reduce(getScentSelected, function(memo, num) {
      return memo + num
    }, 0)
    this.totalScentSelected = totalScentSelected
  },
  reset: function() {
    this.collection.map(function(scent) {
      return scent.clear()
    })
    this.$el.empty()
  },
  setNumChoices: function(numChoices) {
    this.numChoices = numChoices
    this.updateDOM()
  },
  updateDOM: function() {
    var totalProductQuantity = this.numChoices
    var totalProductSelected = this.totalScentSelected || 0
    var totalToComplete = totalProductQuantity - totalProductSelected
    var messageHeader = totalProductSelected + ' of ' + totalProductQuantity

    $('.scents-quantity').html(messageHeader)
    $('.scents-remaining').html(totalToComplete)

    BBSafe.trigger('quantity:toSelect', { numChoices: totalProductQuantity, numSelected: totalProductSelected })
  },
  render: function() {
    this.$el.empty()
    this.collection.forEach(this.addScent, this)
    this.checkQty()
    this.updateDOM()
  }
})

/////////////////////
///  ADDON VIEWS  ///
/////////////////////

var AddonOptionView = TemplatedView.extend({
  template_id: '#addon_option_template'
})

var AddonView = TemplatedView.extend({
  template_id: '#addon_template',
  events: {
    'click .qty-up': 'increaseQuantity',
    'click .qty-down': 'decreaseQuantity'
  },
  increaseQuantity: function(event) {
    event.preventDefault()
    this.model.increaseQuantity()
  },
  decreaseQuantity: function(event) {
    event.preventDefault()
    this.model.decreaseQuantity()
  },
})

var AddonsView = BBSafe.View.extend({
  el: $('.addon-template-holder'),
  initialize: function() {
    _.bindAll(this, 'render')
    this.collection.on('add', this.render)
  },
  addAddon: function(addon) {
    var addonView = new AddonView({ model: addon })
    var addonId = 'addon-' + addon.id
    addonView.render()
    addonView.el.id = addonId
    addonView.el.setAttribute('data-group', 'addons')
    this.$el.append(addonView.el)

    var optionView = new AddonOptionView({ model: addon })
    optionView.render()
    optionView.el.setAttribute('data-target', '#' + addonId)
    $('.addon-options-template-holder').append(optionView.el)
  },
  getAddonChoices: function() {
    return this.collection.filter(function(addon) {
      return addon.get('qty') > 0
    })
  },
  render: function() {
    this.collection.forEach(this.addAddon, this)
  }
})

///////////////////////////
/// CHOSEN ADDONS  VIEWS///
///////////////////////////

var ChosenAddonView = BBSafe.View.extend({
  template: _.template($('#chosen_addon_template').html()),
  events: {
    'click .remove': 'removeAddon'
  },
  initialize: function() {
    _.bindAll(this, 'render')
    this.model.on('change', this.render, this)
  },
  removeAddon: function() {
    this.model.decreaseQuantity()
  },
  render: function() {
    var data = this.model.toJSON()
    this.$el.html(this.template(data))
    return this
  }
})

var ChosenAddonsView = BBSafe.View.extend({
  el: $('.chosen-addon-template-holder'),
  initialize: function() {
    _.bindAll(this, 'render')
    this.collection.on('change', this.render)
  },
  addAddon: function(addon) {
    var chosenAddonView = new ChosenAddonView({ model: addon })
    this.$el.append(chosenAddonView.render().el)
  },
  render: function() {
    this.$el.empty()
    this.collection.forEach(this.addAddon, this)
  }
})

////////////////////////
/// GRAND TOTAL VIEW ///
////////////////////////

var GrandTotalView = TemplatedView.extend({
  el: '.grand-total-template-holder',
  template_id: '#grand_total_template',
})

/////////////////////
///   MAIN VIEW   ///
/////////////////////
var SubscribeView = BBSafe.View.extend({
  el: $(document),
  events: {
    'click [data-bb="next-step"]': 'goToNextTab',
    'show.bs.tab #step-tab-nav': 'scrollToTabs',
    'shown.bs.tab #step-tab-nav': 'updateStepFromTabs',
  },
  initialize: function() {

    _.bindAll(this, 'render')

    this.$tabs = jQuerySafe('#step-tab-nav')

    var quantities = new Quantities()
    var terms = new Terms()
    var scents = new Scents()
    var addons = new Addons()
    var grandTotal = new GrandTotal({
      showTotal: false,
      total: 0
    })

    quantities.reset(availableQuantities)
    terms.reset(availableTerms)
    scents.reset(availableScents)
    addons.reset(availableAddons)

    this.quantitiesView = new QuantitiesView({ model: quantities })
    this.termsView = new TermsView({ model: terms })
    this.scentsView = new ScentsView({ collection: scents })
    this.chosenScentsView = new ChosenScentsView({ collection: scents })
    this.addonsView = new AddonsView({ collection: addons })
    this.chosenAddonsView = new ChosenAddonsView({ collection: addons })
    this.grandTotalView = new GrandTotalView({ model: grandTotal })

    this.listenTo(BBSafe, 'quantity:selectionChanged', this.updateQuantity)
    this.listenTo(BBSafe, 'term:selectionChanged', this.updateTermType)
    this.listenTo(BBSafe, 'addon:quantityChanged', this.updateTotal)

    this.model.set('available_products', availableProducts)
    this.model.set('qty', 2)
    this.model.set('term_type', 3)
    this.updateSelectedProduct()
  },
  /* Go to the next tab, or add to cart if we're on the last tab */
  goToNextTab: function() {
    var $nextTab = this.$tabs.find('li.active').next().find('a')
    if ($nextTab.length) {
      $nextTab.tab('show')
    } else {
      this.addToCart()
    }
  },
  /* Scroll back to the tab area so tab content is visible after stepping */
  scrollToTabs: function() {
    $('html, body').animate({
      scrollTop: this.$tabs.offset().top
    }, 500)
  },
  updateStepFromTabs: function() {
    var currentStep = this.$tabs.find('li.active').index() + 1
    this.grandTotalView.model.set('showTotal', currentStep > 1)
  },
  render: function() {
    this.quantitiesView.render()
    this.termsView.render()
    this.updateAvailableScents()
    this.scentsView.render()
    this.chosenScentsView.render()
    this.addonsView.render()
    this.chosenAddonsView.render()
    this.grandTotalView.render()
    $('.loading').removeClass('active')
  },
  calcNumChoices: function() {
    var qty = this.model.get('qty')
    var termType = this.model.get('term_type')
    return qty * termType
  },
  updateQuantity: function(newQuantity) {
    if (newQuantity.get('qty') != this.model.get('qty')) {
      this.model.set('qty', newQuantity.get('qty'))
    }
    this.updateAvailableScents()
    this.updateSelectedProduct()
  },
  updateTermType: function(newTermType) {
    if (newTermType != this.model.get('term_type')) {
      this.model.set('term_type', newTermType)
    }
    this.updateAvailableScents()
    this.updateSelectedProduct()
  },
  updateSelectedProduct: function() {
    var selectedProduct = _.findWhere(this.model.get('available_products'), { qty: this.model.get('qty'), term_type: this.model.get('term_type') })

    if (selectedProduct) {
      this.model.set('selected_product', selectedProduct)
      this.updateTotal()
    }
  },
  updateTotal: function() {
    var total = this.addonsView.getAddonChoices().reduce(function(prev, next) {
      return prev + (next.get('price') * next.get('qty'))
    }, 0)
    total += this.model.get('selected_product').price
    this.grandTotalView.model.set('total', total)
  },
  updateAvailableScents: function() {
    this.chosenScentsView.setNumChoices(this.calcNumChoices())
  },
  getChosenScentMetadata: function() {
    var metadata = {}
    var key = 'mf:cart.survey.scent_IDX_.string'
    var numChoices = this.calcNumChoices()

    // Add metadata for all scents chosen by the user
    this.scentsView.getScentChoices().forEach(function(scent) {
      for (var i = 0; i < scent.get('qty'); i++) {
        metadata[key.replace('_IDX_', numChoices)] = scent.get('sku')
        numChoices--
      }
    })

    // Add metadata for any unset scents, setting them to "Squatch Picks"
    while (numChoices > 0) {
      metadata[key.replace('_IDX_', numChoices)] = 'squatch-picks'
      numChoices--
    }

    return metadata
  },
  addToCart: function() {
    $('.loading')
      .html('Hang on a sec, Squatch is prepping your order.')
      .addClass('active')

    // Add the first product (the subscription) to the order
    var data = {
      clear_cart: true,
      products: [{
        product_id: this.model.get('selected_product').id,
        metadata: this.getChosenScentMetadata(),
        term_cycles: 1,
        quantity: 1
      }]
    }

    // Add all addons to the order
    this.addonsView.getAddonChoices().forEach(function(addon) {
      data.products.push({
        product_id: addon.get('id'),
        term_cycles: addon.get('is_single_purchasable') ? null : 1,
        quantity: addon.get('qty')
      })
    })

    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      url: '/cart/add',
      success: function() {
        window.location = '/checkout'
      }
    })
  }
})

$('.subscribe_btn').click(function() { $(window).scrollTop($('.panel-collapse.collapse.in').offset().top - 90) })
var subscribeView = new SubscribeView({ model: new SubscribeModel() })
subscribeView.render()
