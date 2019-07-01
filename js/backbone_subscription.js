var numItems = "";
var subsType;
var subsQty;
	
var availableQuantities = availableQuantities || [];
var availableTerms = availableTerms || [];
var availableScents = availableScents || [];
var availableAddons = availableAddons || [];
var availableProducts = availableProducts || [];

var SubscribeModel = BBSafe.Model.extend({});
var Quantity = BBSafe.Model.extend({});
var Term = BBSafe.Model.extend({});
var Scent = BBSafe.Model.extend({});
var Addon = BBSafe.Model.extend({});

var Quantities = BBSafe.Collection.extend({ model: Quantity });
var Terms = BBSafe.Collection.extend({ model: Term });
var Scents = BBSafe.Collection.extend({ model: Scent });
var Addons = BBSafe.Collection.extend({ model: Addon });

var TemplatedView = BBSafe.View.extend({
  template_id: '',
  render: function(){
    this.$el.html(_.template($(this.template_id).html())(this.model.toJSON())); 
  },
  initialize: function(){
    _.bindAll(this, "render");
    this.model.on('change', this.render, this);
  }
});

/////////////////////
////QUANTITY VIEWS///
/////////////////////
var QuantityView = TemplatedView.extend({ 
  events: {
    "click .btn-product-select":	"quantitySelected"
  },
  template_id: '#product_template',
  quantitySelected: function(event){
    event.preventDefault();
    this.model.set("selected", true);
    BBSafe.trigger("quantity:selectionChanged", this.model);
  }
});
var QuantitiesView = BBSafe.View.extend({
  el: $(".product-template-holder"),
  initialize: function(){
    _.bindAll(this, "render");
    this.quantityViews = [];
    _.each(this.model.models, function(quantity){
      this.quantityViews.push(new QuantityView({
        model: quantity
      }));
    }, this);
    
    this.listenTo(BBSafe, "quantity:selectionChanged", this.quantitySelectionChanged);
    
  },
  render: function(){
    _.each(this.quantityViews, function(quantityView){
      quantityView.render();
      this.$el.append(quantityView.el);
    }, this);
  },
  quantitySelectionChanged: function(selectedQuantity){
    console.log('selectedQuantity: ' + selectedQuantity);
  	_.each(this.quantityViews, function(quantityView){
      quantityView.model.set('selected', quantityView.model == selectedQuantity);
    }, this);
  }
});

/////////////////////
///   TERM VIEWS  ///
/////////////////////
var TermView = TemplatedView.extend({ 
  events: {
    "click .btn-term-select":	"termSelected"
  },
  template_id: '#term_template',
  termSelected: function(event){
    event.preventDefault();
    this.model.set("selected", true);
    BBSafe.trigger("term:selectionChanged", this.model.get('term_type'));
  }
});

var TermsView = BBSafe.View.extend({
  el: $(".term-template-holder"),
  initialize: function(){
    _.bindAll(this, "render");
    this.termViews = [];
    _.each(this.model.models, function(term){
      this.termViews.push(new TermView({
        model: term
      }));
    }, this);

    this.listenTo(BBSafe, "term:selectionChanged", this.termSelectionChanged);
  },
  render: function(){
    console.log("In render of terms view");	
    _.each(this.termViews, function(termView){
      termView.render();
      this.$el.append(termView.el);
    }, this);
    console.log("Done with render on terms view");
  },  
  termSelectionChanged: function(term_type){
  	_.each(this.termViews, function(termView){
    	if (termView.model.get('term_type') != term_type){
        	termView.model.set('selected', false);
        }
    }, this);
  }
});

/* Quantity validation */

var productQuantity = function(){
    var qty = subsQty;
    var termType = subsType;    
    return qty * termType;
};

var checkQuantity = function(){
    
    console.log('Checking quantity...');
    
    var totalProductQuantity = productQuantity();
    var totalProductSelected = $('.number_of_box').length;
    var totalToComplete = totalProductQuantity - totalProductSelected;
    console.log('totalProductQuantity: ' + totalProductQuantity);
    console.log('totalProductSelected: ' + totalProductSelected);
    console.log('totalToComplete: ' + totalToComplete);
    var totalSelectedPlural = totalProductSelected > 1 ? 's' : '';
    var totalToCompletePlural = totalToComplete > 1 ? 's' : '';
    var message = 'You have only chosen ' + totalProductSelected + ' bar' + totalSelectedPlural + ', please select ' + totalToComplete + ' bar' + totalToCompletePlural + ' to continue.';
    
    if (totalProductSelected === totalProductQuantity) {
      $('#collapseFour_btn').fadeIn();
      $('#select_msg').fadeOut();
    } else {
      $('#collapseFour_btn').fadeOut();
      $('#select_msg')
        .html(message)
      	.fadeIn();
    }
    
};

/////////////////////
///  SCENT VIEWS  ///
/////////////////////
var ScentView = TemplatedView.extend({ 
  template_id: '#scent_template',
  events: {
    "click .qty-up":	"increaseQuantity", 
    "click .qty-down":	"decreaseQuantity"
  },
  increaseQuantity: function(event){
    event.preventDefault();
    BBSafe.trigger("scent:qtyChange", this.model, 1);
	numItems = $('.number_of_box').length;
	/*if(numItems < 3){
		 
		$('#collapseFour_btn').prop("href", false);
		$('#collapseFour_btn').addClass('not_allow_btn');
		$('#select_msg').fadeIn();
	}else{
		$('#collapseFour_btn').attr("href","#collapseFour");
		$('#collapseFour_btn').removeClass('not_allow_btn');
		$('#select_msg').fadeOut();
	}*/
    checkQuantity();	
  },
  decreaseQuantity: function(event){
    event.preventDefault();
    if (this.model.get('qty') != 0){
      BBSafe.trigger("scent:qtyChange", this.model, -1);
		numItems = $('.number_of_box').length;
		/*if(numItems < 3){
			 
			$('#collapseFour_btn').prop("href", false);
			$('#collapseFour_btn').addClass('not_allow_btn');
			$('#select_msg').fadeIn();
		}else{
			$('#collapseFour_btn').attr("href","#collapseFour");
			$('#collapseFour_btn').removeClass('not_allow_btn');
			$('#select_msg').fadeOut();
		}*/
    }
    checkQuantity();
  }
});
var ScentsView = BBSafe.View.extend({
  el: $(".scent-template-holder"),

  initialize: function(){
    _.bindAll(this, "render");
    this.scentViews = [];
    _.each(this.model.models, function(scent){
      this.scentViews.push(new ScentView({
        model: scent
      }));
    }, this);
    this.model.on('change', this.render, this);
    this.chosenScentsView = new ChosenScentsView({ model: this.model });
    this.listenTo(BBSafe, "scent:qtyChange", this.updateScentQty);
  },
  render: function(){
    console.log("In render of scents view");
    _.each(this.scentViews, function(scentView, i){
      if (i % 3 == 0){
        this.$el.append("<div class='row scent-row'></div>"); 
      }
      scentView.render();
      this.$el.find("div.scent-row:last").append(scentView.el);
    }, this);
    this.chosenScentsView.render();

    console.log("Done with render on scents view");
  },
  updateScentQty: function(scent, amount){
    var currentSelections = 0;
    _.each(this.model.models, function(scent){
    	currentSelections += scent.get('qty');
    });
    	
    if (currentSelections + amount <= this.numChoices){
  		scent.set('qty', scent.get('qty') + amount);
    }
  },
  getScentChoices: function(){
    var chosen = [];
    _.each(this.model.models, function(scent){
    	for(var i=0; i<scent.get('qty'); ++i){
          chosen.push( scent.get('sku') ); 
        }
    });
    
    return chosen;
  },
  setNumChoices: function(numChoices){
    this.numChoices = numChoices;
    var selectedQty = 0;
    _.each(this.model.models, function(scent){
      if (scent.get('qty') == 0){
      }
      else if (numChoices == selectedQty){
        scent.set('qty', 0);
      }
      else if (selectedQty + scent.get('qty') <= numChoices){
        selectedQty += scent.get('qty'); 
      }
      else{
        scent.set('qty', numChoices - selectedQty);
        selectedQty = numChoices;
      }
    }, this);

    if (selectedQty < numChoices && this.model.length > 0){
      var toAdd = numChoices - selectedQty
      var threshold = 0;
      while(toAdd > 0){
        _.each(this.model.models, function(scent){
		  if(scent.get('outofstock') != 0 && scent.get('outofstock_purchase')!="False"){
			   if (toAdd > 0 && scent.get('qty') == threshold){
				scent.set('qty', scent.get('qty') + 1);
				toAdd -= 1;
			  } 
		  }
		  
		  
        });
        threshold += 1;
      }
    }
  }
});


/////////////////////
/// SCENT VIEWS #2///
///(CHOSEN SCENTS)///
/////////////////////
var ChosenScentView = TemplatedView.extend({ template_id: '#chosen_scent_template' });

var ChosenScentsView = BBSafe.View.extend({
  el: $(".chosen-scent-template-holder"),
  initialize: function(){
    _.bindAll(this, "render");
    this.chosenScentViews = [];
    _.each(this.model.models, function(scent){
      this.chosenScentViews.push(new ChosenScentView({
        model: scent
      }));
    }, this);
  },
  render: function(){
    var cnt = 0;
    var $toAppend = this.$el.clone().empty();
    _.each(this.chosenScentViews, function(chosenScentView, i){
      for(var x=0; x < chosenScentView.model.get('qty'); ++x){
        if (cnt == 0){
          $toAppend.append("<div class='row chosen-scent-row'></div>"); 
        }
        chosenScentView.render();
        $toAppend.find("div.chosen-scent-row:last").append(chosenScentView.$el.clone());
        cnt += 1;
      }
    }, this);
    this.$el.empty().append($toAppend);
    console.log("Done with render on chosen scents view");
  }
});


/////////////////////
///  ADDON VIEWS  ///
/////////////////////
var AddonView = TemplatedView.extend({ 
  template_id: '#addon_template', 
  events: {
    "click .btn-addon-select":	"addonSelected"
  }, 
  addonSelected: function(event){
    event.preventDefault();
    this.model.set("selected", (this.model.get('selected') == false));
  }
});
var AddonsView = BBSafe.View.extend({
  el: $(".addon-template-holder"),
  initialize: function(){
    _.bindAll(this, "render");
    this.addonViews = [];
    _.each(this.model.models, function(addon){
      this.addonViews.push(new AddonView({
        model: addon
      }));
    }, this);

  },
  render: function(){
    console.log("In render of addons view");	
    _.each(this.addonViews, function(addonView){
      addonView.render();
      this.$el.append(addonView.el);
    }, this);
    console.log("Done with render on addons view");
	
  },
  getAddonChoices: function(){
  	var chosen = [];
    _.each(this.model.models, function(addon){
    	if (addon.get('selected') === true){
        	chosen.push({ id: addon.get('id'), is_single_purchasable: addon.get('is_single_purchasable') === "True" });
        }
    });
    return chosen;
  }
}); 

/////////////////////
///   MAIN VIEW   ///
/////////////////////
var SubscribeView = BBSafe.View.extend({
  el: $(document),
  events: {
    "click .submit-subscription": "submitClicked"
    //"click #collapseFour_btn": "checkQuantity"
  }, 
  initialize: function(){

    _.bindAll(this, "render");

    var collectionQuantities = new Quantities();
    var collectionTerms = new Terms();
    var collectionScents = new Scents();
    var collectionAddons = new Addons();

    _.each(availableQuantities, function(item){ collectionQuantities.add(item);});
    _.each(availableScents, function(item){ collectionScents.add(item);});
    _.each(availableAddons, function(item){collectionAddons.add(item);});
    _.each(availableTerms, function(item){collectionTerms.add(item);});

    this.quantitiesView = new QuantitiesView({ model: collectionQuantities });
    this.termsView = new TermsView({ model: collectionTerms });
    this.scentsView = new ScentsView({ model: collectionScents });
    this.addonsView = new AddonsView({ model: collectionAddons });

    this.listenTo(BBSafe, "quantity:selectionChanged", this.updateQuantity);
    this.listenTo(BBSafe, "term:selectionChanged", this.updateTermType);

    this.model.set('available_products', availableProducts);
    this.model.set('qty', 2);
    this.model.set('term_type', 3);
    this.updateSelectedProduct();
  },
  render: function(){
    this.quantitiesView.render();
    this.termsView.render();
    this.updateAvailableScents();
    this.addonsView.render();
  },
  calcNumChoices: function(){
    var qty = this.model.get('qty');
    var termType = this.model.get('term_type');
    return qty * termType;
  },
  updateQuantity: function(newQuantity){
    if (newQuantity.get('qty') != this.model.get('qty')){
      this.model.set('qty', newQuantity.get('qty'));
    }
    this.updateAvailableScents();
    this.updateSelectedProduct();
  },
  updateTermType: function(newTermType){
    if (newTermType != this.model.get('term_type')){
      this.model.set('term_type', newTermType);
    }
    this.updateAvailableScents();
    this.updateSelectedProduct();
  },
  updateSelectedProduct: function(){
  	var selectedProduct = _.findWhere(this.model.get('available_products'), { qty: this.model.get('qty'), term_type: this.model.get('term_type') });
	
    subsType = this.model.get('term_type');
    subsQty = this.model.get('qty');
    
    if (selectedProduct){
      console.log("Updating product to id: " + selectedProduct.id);
      this.model.set('selected_product', selectedProduct);
    }
  },
  updateAvailableScents: function(){
    this.scentsView.setNumChoices(this.calcNumChoices());
  },
  getChosenScentMetadata: function(){
    var key = "mf:cart.survey.scent_IDX_.string";
    var metadata = {};
    var scentChoices = this.scentsView.getScentChoices();
    for (var i=0;i<scentChoices.length; ++i){
    	metadata[key.replace("_IDX_", i+1)] = scentChoices[i];
    }
    return metadata;
  },
  submitClicked: function(event){
    event.preventDefault();
    var data = {}
    data.products = [];
    
    data.products.push({
    	product_id: this.model.get('selected_product').id,
      	term_cycles: 1,
      	quantity: 1
    });
    
    _.each(this.addonsView.getAddonChoices(), function(product){
    	data.products.push({
        	product_id: product.id,
          	term_cycles: product.is_single_purchasable ? null : 1,
          	quantity: 1
        });
    });
    
    data.products[0]['metadata'] = this.getChosenScentMetadata();
    //This causes the cart to be emptied before this purchase is made.
    data.clear_cart = true;
    
    $.ajax({
    	type: 'POST',
      	contentType: 'application/json',
      	data: JSON.stringify(data),
      	dataType: 'json',
      	url: '/cart/add',
      	success: function(e){
        	window.location = '/checkout';
        }
    });
  }
});
$('.subscribe_btn').click(function(){  $(window).scrollTop($(".panel-collapse.collapse.in").offset().top-90);  })
var subscribeView = new SubscribeView({ model: new SubscribeModel() });
subscribeView.render();