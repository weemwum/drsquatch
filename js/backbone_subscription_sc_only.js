var numItems = "";
var subsType;
var subsQty;

var availableHaircare = availableHaircare || [];
var availableAddons = availableAddons || [];
var availableProducts = availableProducts || [];

var SubscribeModel = BBSafe.Model.extend({});

var HaircareProduct = BBSafe.Model.extend({
  increaseQuantity: function() {
    this.canAdd = true;
    if (this.get('qty') == 3) {
      this.canAdd = false;
    }
    if (this.canAdd) {
      this.set('qty', this.get('qty') + 1);
    }
  },
  decreaseQuantity: function() {
    if (this.get('qty') !== 0) {
      this.set('qty', this.get('qty') - 1);
      this.canAdd = true;
    }
  }
});

var Addon = BBSafe.Model.extend({});

var Haircare = BBSafe.Collection.extend({
  model: HaircareProduct
});
var Addons = BBSafe.Collection.extend({
  model: Addon
});

var TemplatedView = BBSafe.View.extend({
  template_id: '',
  render: function() {
    this.$el.html(_.template($(this.template_id).html())(this.model.toJSON()));
  },
  initialize: function() {
    _.bindAll(this, "render");
    this.model.on('change', this.render, this);
  }
});

/////////////////////
////HAIRCARE VIEWS///
/////////////////////
var HairProductView = TemplatedView.extend({
  events: {
    "click .btn-product-select": "quantitySelected",
    "click .qty-up": "increaseQuantity",
    "click .qty-down": "decreaseQuantity"
  },
  template_id: '#haircare_template',
  increaseQuantity: function(event) {
    event.preventDefault();
    this.model.increaseQuantity();
    BBSafe.trigger("hairproduct:quantityChanged", this.model);
  },
  decreaseQuantity: function(event) {
    event.preventDefault();
    this.model.decreaseQuantity();
    BBSafe.trigger("hairproduct:quantityChanged", this.model);
  },
  quantitySelected: function(event) {
    event.preventDefault();
    this.model.set("selected", true);
    BBSafe.trigger("hairproduct:selectionChanged", this.model);
  }
});
var HaircareView = BBSafe.View.extend({
  el: $(".haircare-template-holder"),
  initialize: function() {
    _.bindAll(this, "render");
    this.collection.on("add", this.render);
    this.listenTo(BBSafe, "hairproduct:selectionChanged", this.quantitySelectionChanged);
  },
  addQuantity: function(quantity) {
    var haircareView = new HairProductView({
      model: quantity
    });
    haircareView.render();
    this.$el.append(haircareView.el);
  },
  updateSelectedQty: function() {
    this.currentQty = this.collection.filter(function(quantity) {
      return quantity.get("selected") === !0
    });
  },
  quantitySelectionChanged: function(quantity) {
    this.currentQty[0].set("selected", !1);
    quantity.set("selected", !0);
    this.currentQty[0] = quantity;
    BBSafe.trigger("quantity:Reset");
  },
  render: function() {
    this.collection.forEach(this.addQuantity, this);
    this.updateSelectedQty();
  }
});

/////////////////////
///  ADDON VIEWS  ///
/////////////////////
var AddonView = TemplatedView.extend({
  template_id: '#addon_template',
  events: {
    "click .btn-addon-select": "addonSelected"
  },
  addonSelected: function(event) {
    event.preventDefault();
    this.model.set("selected", (this.model.get('selected') === false));
  }
});

var AddonsView = BBSafe.View.extend({
  el: $(".addon-template-holder"),
  initialize: function() {
    _.bindAll(this, "render");
    this.collection.on("add", this.render);
  },
  addAddons: function(addon) {
    var addonView = new AddonView({
      model: addon
    });
    switch (addonView.render(), addon.get("category")) {
      case "most-popular":
        this.$el.find(".addon-most-polular").append(addonView.el);
        break;
      case "cologne":
        this.$el.find(".addon-cologne").append(addonView.el);
        break;
      case "shave":
        this.$el.find(".addon-shave").append(addonView.el);
        break;
      case "hair":
        this.$el.find(".addon-hair").append(addonView.el);
        break;
      default:
        this.$el.append(addonView.el)
    }
  },
  prePopulateAddon: function(addonNames) {
    var self = this;
    addonNames.forEach(function(addonName) {
      var product = self.collection.filter(function(addon) {
        return addon.get('name') === addonName;
      });
      product[0].set('selected', true);
    });
  },
  getAddonChoices: function() {
    var chosen = [];
    return this.collection.forEach(function(addon) {
      addon.get("selected") === !0 && chosen.push({
        id: addon.get("id"),
        is_single_purchasable: "True" === addon.get("is_single_purchasable")
      })
    }), chosen
  },
  render: function() {
    this.collection.forEach(this.addAddons, this);
    //this.prePopulateAddon(["Soap Saver"]);
  }
});

/////////////////////
///   MAIN VIEW   ///
/////////////////////
var SubscribeView = BBSafe.View.extend({
  el: $(document),
  events: {
    "click .submit-subscription": "submitClicked"
  },
  initialize: function() {

    _.bindAll(this, "render");

    var collectionHaircare = new Haircare();
    var collectionAddons = new Addons();

    this.haircareView = new HaircareView({
      collection: collectionHaircare
    }),
      this.addonsView = new AddonsView({
      collection: collectionAddons
    });

    // Populate collections from hardcoded objects
    collectionHaircare.reset(availableHaircare);
    collectionAddons.reset(availableAddons);

    this.listenTo(BBSafe, "hairproduct:selectionChanged", this.updateHairproduct);
    this.listenTo(BBSafe, "hairproduct:quantityChanged", this.updateHairproduct);
    
    this.model.set('available_products', availableProducts);
    //this.updateHairproduct();
  },
  render: function() {
    this.haircareView.render(),
    this.addonsView.render(),
    $(".loading").removeClass("active")
  },
  updateHairproduct: function(hairproduct) {
    var productQty = hairproduct.get('qty');
    var ids = hairproduct.get('ids');
    var availableProducts = this.model.get('available_products');

    var products = _.filter(availableProducts, function(item) {
      return _.contains(ids, item.id)
    });

    var selectedProduct = _.filter(products, function(item) {
      return item.qty == productQty
    });

    if (selectedProduct) {
      this.model.set('selected_hair_product', selectedProduct[0]);
    }

    console.log('hair product', selectedProduct[0])

  },
  submitClicked: function(event) {
    event.preventDefault();
    $(".loading").html("Hang on a sec, Squatch is prepping your order.").addClass("active");
    var data = {};
    data.products = [];

    data.products.push({
      product_id: this.model.get('selected_hair_product').id,
      term_cycles: 1, // Force quartely shipment
      quantity: 1
    });
    // quantity: this.model.get('selected_hair_product').qty

    _.each(this.addonsView.getAddonChoices(), function(product) {
      data.products.push({
        product_id: product.id,
        term_cycles: product.is_single_purchasable ? null : 1,
        quantity: 1
      });
    });

    // console.log(JSON.stringify(data));
    //This causes the cart to be emptied before this purchase is made.
    data.clear_cart = true;

    $.ajax({
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      dataType: 'json',
      url: '/cart/add',
      success: function(e) {
        window.location = '/checkout';
      }
    });
  }
});
$('.subscribe_btn').click(function() {
  setTimeout(function() {
  	$(window).scrollTop($('#headingTwo').offset().top - 90);
  }, 500);
});
var subscribeView = new SubscribeView({
  model: new SubscribeModel()
});

subscribeView.render();