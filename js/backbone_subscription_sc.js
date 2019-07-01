var numItems = "";
var subsType;
var subsQty;

var availableQuantities = availableQuantities || [];
var availableHaircare = availableHaircare || [];
var availableTerms = availableTerms || [];
var availableScents = availableScents || [];
var availableAddons = availableAddons || [];
var availableProducts = availableProducts || [];

var SubscribeModel = BBSafe.Model.extend({});
var Quantity = BBSafe.Model.extend({});
var Term = BBSafe.Model.extend({});

var Scent = BBSafe.Model.extend({
    initialize: function() {
        this.listenTo(BBSafe, "quantity:toSelect", this.updateQuantity);
    },
    updateQuantity: function(options) {
        this.numToSelect = options.numChoices;
        this.numSelected = options.numSelected;
    },
    increaseQuantity: function() {
        this.canAdd = true;
        if (this.numSelected >= this.numToSelect) {
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

var Quantities = BBSafe.Collection.extend({ model: Quantity });
var Haircare = BBSafe.Collection.extend({ model: HaircareProduct });
var Terms = BBSafe.Collection.extend({ model: Term });
var Scents = BBSafe.Collection.extend({ model: Scent });
var Addons = BBSafe.Collection.extend({ model: Addon });

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
////QUANTITY VIEWS///
/////////////////////
var QuantityView = TemplatedView.extend({
    events: {
        "click .btn-product-select": "quantitySelected"
    },
    template_id: '#product_template',
    quantitySelected: function(event) {
        event.preventDefault();
        this.model.set("selected", true);
        BBSafe.trigger("quantity:selectionChanged", this.model);
    }
});
var QuantitiesView = BBSafe.View.extend({
    el: $(".product-template-holder"),
    initialize: function() {
        _.bindAll(this, "render");
        this.collection.on("add", this.render);
        this.listenTo(BBSafe, "quantity:selectionChanged", this.quantitySelectionChanged);
    },
    addQuantity: function(quantity) {
        var quantityView = new QuantityView({
            model: quantity
        });
        quantityView.render();
        this.$el.append(quantityView.el);
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
///   TERM VIEWS  ///
/////////////////////
var TermView = TemplatedView.extend({
    events: {
        "click .btn-term-select": "termSelected"
    },
    template_id: "#term_template",
    termSelected: function(event) {
        event.preventDefault();
        BBSafe.trigger("term:selectionChanged", this.model);
    }
});

var TermsView = BBSafe.View.extend({
    el: $(".term-template-holder"),
    initialize: function() {
        _.bindAll(this, "render");
        this.collection.on("add", this.render);
        this.listenTo(BBSafe, "term:selectionChanged", this.termSelectionChanged);
    },
    addTerm: function(term) {
        var termView = new TermView({
            model: term
        });
        termView.render(), this.$el.append(termView.el)
    },
    updateSelectedTerm: function() {
        this.currentTerm = this.collection.filter(function(term) {
            return term.get("selected") === true
        })
    },
    termSelectionChanged: function(selectedTerm) {
        this.currentTerm[0].set("selected", false);
        selectedTerm.set("selected", true);
        this.currentTerm[0] = selectedTerm;
        BBSafe.trigger("quantity:Reset");
    },
    render: function() {
        this.collection.forEach(this.addTerm, this);
        this.updateSelectedTerm();
    }
});

/////////////////////
///  SCENT VIEWS  ///
/////////////////////
var ScentView = BBSafe.View.extend({
    template: _.template($('#scent_template').html()),
    events: {
        "click .qty-up": "increaseQuantity",
        "click .qty-down": "decreaseQuantity"
    },
    initialize: function() {
        _.bindAll(this, "render");
        this.model.on('change', this.render, this);
    },
    increaseQuantity: function(event) {
        event.preventDefault();
        this.model.increaseQuantity();
    },
    decreaseQuantity: function(event) {
        event.preventDefault();
        this.model.decreaseQuantity();
    },
    render: function() {
        var html = this.model.toJSON();
        this.$el.html(this.template(html));
    }
});

var ScentsView = BBSafe.View.extend({
    el: $('.scent-template-holder'),
    initialize: function() {
        _.bindAll(this, "render");
        this.collection.on("add", this.render);
        this.listenTo(BBSafe, "quantity:Reset", this.resetScents);
    },
    addScent: function(scent) {
        var scentView = new ScentView({
            model: scent
        });
        scentView.render();
        this.$el.append(scentView.el);
    },
    resetScents: function() {
        this.collection.forEach(function(scent) {
            scent.set("qty", 0);
        });
    },
    getScentChoices: function() {
        var chosen = this.collection.filter(function(scent) {
            return scent.get("qty") > 0
        });
        return chosen
    },
    render: function() {
        this.collection.forEach(this.addScent, this)
    }
});


/////////////////////
/// SCENT VIEWS #2///
///(CHOSEN SCENTS)///
/////////////////////

var ChosenScentView = BBSafe.View.extend({
    template: _.template($('#chosen_scent_template').html()),
    events: {
        "click .remove": "removeScent"
    },
    initialize: function() {
        _.bindAll(this, "render");
        this.model.on('change', this.render, this);
    },
    removeScent: function() {
        this.model.decreaseQuantity();
    },
    render: function() {
        var data = this.model.toJSON();
        this.$el.html(this.template(data));

        return this;
    }
});

var ChosenScentsView = BBSafe.View.extend({
    el: $('.chosen-scent-template-holder'),
    initialize: function() {
        _.bindAll(this, "render");
        this.collection.on('change', this.render);
    },
    addScent: function(scent) {
        var chosenScentView = new ChosenScentView({ model: scent });
        this.$el.append(chosenScentView.render().el);
    },
    checkQty: function() {
        var getScentSelected = this.collection.map(function(scent) {
            return scent.get('qty');
        });
        var totalScentSelected = _.reduce(getScentSelected, function(memo, num) {
            return memo + num;
        }, 0);
        this.totalScentSelected = totalScentSelected;
    },
    reset: function() {
        this.collection.map(function(scent) {
            return scent.clear();
        });
        this.$el.empty();
    },
    setNumChoices: function(numChoices) {
        this.numChoices = numChoices;
        this.updateDOM();
    },
    updateDOM: function() {
        var totalProductQuantity = this.numChoices;
        var totalProductSelected = this.totalScentSelected || 0;
        var totalToComplete = totalProductQuantity - totalProductSelected;
        var totalSelectedPlural = totalProductSelected > 1 ? 's' : '';
        var totalToCompletePlural = totalToComplete > 1 ? 's' : '';
        var messageFooter = 'You have only chosen ' + totalProductSelected + ' bar' + totalSelectedPlural + ', please select ' + totalToComplete + ' bar' + totalToCompletePlural + ' to continue.';
        var messageHeader = '(' + totalProductSelected + ' out of ' + totalProductQuantity + ')';

        $('.scents-quantity').html(messageHeader);

        if (totalProductSelected > 0 && totalProductSelected != totalProductQuantity) {
            // $('.chosen-scents').addClass('active');
        } else {
            // $('.chosen-scents').removeClass('active');
        }

        if (totalProductSelected === totalProductQuantity) {
            // $('#collapseFour_btn').fadeIn();
            // $('.submit-subscription').fadeIn();
            // $('#select_msg').fadeOut();
            // $('#select_msg_checkout').fadeOut();
        } else {
            // $('#collapseFour_btn').fadeOut();
            // $('.submit-subscription').fadeOut();
            // $('#select_msg')
            //     .html(messageFooter)
            //     .fadeIn();
            // $('#select_msg_checkout')
            //     .html(messageFooter)
            //     .fadeIn();
        }

        BBSafe.trigger("quantity:toSelect", { numChoices: totalProductQuantity, numSelected: totalProductSelected });

    },
    render: function() {
        this.$el.empty();
        var chosen = this.collection.filter(function(chosenScent) {
            return chosenScent.get('qty') !== 0;
        });
        chosen.forEach(this.addScent, this);
        this.checkQty();
        this.updateDOM();
    }
});

var ChosenScentsPlaceholderView = BBSafe.View.extend({
    el: $('.chosen-scent-placeholder'),
    placeholder: _.template($('#chosen_scent_placeholder').html()),
    initialize: function() {
        this.listenTo(BBSafe, "quantity:toSelect", this.updateQuantity);
    },
    updateQuantity: function(options) {
        // console.log('options', options);
        // var self = this;
        // self.$el.empty();
        // var numPlaceholders = options.numChoices - options.numSelected;
        // for (var i = 0; i < numPlaceholders; i++) {
        //     self.$el.append(self.placeholder);
        // }
        var t = this;
        t.$el.empty();
        var n, i = this.collection.filter(function(options) {
                return options.get("qty") > 1
            }),
            s = i.map(function(options) {
                return options.get("qty")
            }),
            l = _.reduce(s, function(options, t) {
                return options + t
            }, 0);
        n = l > 0 ? l - 1 : 0;
        for (var c = options.numChoices - n, a = 0; c > a; a++) t.$el.append(t.placeholder)
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
    prePopulateAddon: function (addonNames) {
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
        this.prePopulateAddon(["Soap Saver"]);
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

        var collectionQuantities = new Quantities();
        var collectionHaircare = new Haircare();
        var collectionTerms = new Terms();
        var scents = new Scents();
        var chosenScentsView = new ChosenScentsView({ collection: scents });
        var collectionAddons = new Addons();

        this.quantitiesView = new QuantitiesView({
            collection: collectionQuantities
        }),
        this.haircareView = new HaircareView({
            collection: collectionHaircare
        }),
        this.termsView = new TermsView({
            collection: collectionTerms
        }),
        this.scentsView = new ScentsView({
            collection: scents
        }),
        this.chosenScentsView = new ChosenScentsView({
            collection: scents
        }),
        this.addonsView = new AddonsView({
            collection: collectionAddons
        }),
        this.scentsPlaceholderView = new ChosenScentsPlaceholderView({
            collection: scents
        });

        // Populate scents from hardcoded objects
        collectionQuantities.reset(availableQuantities);
        collectionHaircare.reset(availableHaircare);
        collectionTerms.reset(availableTerms);
        scents.reset(availableScents);
        collectionAddons.reset(availableAddons);

        this.listenTo(BBSafe, "quantity:selectionChanged", this.updateQuantity);
        this.listenTo(BBSafe, "hairproduct:selectionChanged", this.updateHairproduct);
        this.listenTo(BBSafe, "hairproduct:quantityChanged", this.updateHairproduct);
        this.listenTo(BBSafe, "term:selectionChanged", this.updateTermType);

        this.model.set('available_products', availableProducts);
        this.model.set('qty', 2);
        this.model.set('term_type', 3);
        this.updateSelectedProduct();
    },
    render: function() {
        this.quantitiesView.render(),
        this.haircareView.render(),
        this.termsView.render(),
        this.scentsView.render(),
        this.updateAvailableScents(),
        this.addonsView.render(),
        $(".loading").removeClass("active")
    },
    calcNumChoices: function() {
        var qty = this.model.get('qty');
        var termType = this.model.get('term_type');
        return qty * termType;
    },
    updateQuantity: function(newQuantity) {
        if (newQuantity.get('qty') != this.model.get('qty')) {
          this.model.set('qty', newQuantity.get('qty'));
        }
        this.updateAvailableScents();
        this.updateSelectedProduct();
    },
    updateHairproduct: function(hairproduct) {
        var productQty = hairproduct.get('qty');
        var ids = hairproduct.get('ids');
        var availableProducts = this.model.get('available_products');

        var products = _.filter(availableProducts, function(item){ 
          return _.contains(ids, item.id) 
        });

        var selectedProduct = _.filter(products, function(item) {
          return item.qty == productQty 
        });

        if (selectedProduct) {
            this.model.set('selected_hair_product', selectedProduct[0]);
        }

        // console.log('hair product', selectedProduct[0])

    },
    updateTermType: function(newTermType) {
        if (newTermType != this.model.get('term_type')) {
            this.model.set('term_type', newTermType.get('term_type'));
        }
        this.updateAvailableScents();
        this.updateSelectedProduct();
    },
    updateSelectedProduct: function() {
        var selectedProduct = _.findWhere(this.model.get('available_products'), {
            qty: this.model.get('qty'),
            term_type: this.model.get('term_type'),
            type: 'soap'
        });
        console.log('model', this.model);
        console.log('product', selectedProduct);

        subsType = this.model.get('term_type');
        subsQty = this.model.get('qty');

        if (selectedProduct) {
            this.model.set('selected_product', selectedProduct);
        }
    },
    updateAvailableScents: function() {
        this.chosenScentsView.setNumChoices(this.calcNumChoices());
    },
    getChosenScentMetadata: function() {
        var key = "mf:cart.survey.scent_IDX_.string";
        var metadata = {};
        var scentChoices = this.scentsView.getScentChoices();
        
        var totalProductQuantity = this.calcNumChoices();
        var getScentSelected = scentChoices.map(function(scent) {
            return scent.get('qty');
        });

        var totalProductSelected = _.reduce(getScentSelected, function(memo, num) {
            return memo + num;
        }, 0);

        var squatchPick = new Scent({
          "sku": "squatch-picks",
          "qty": 1
        });

        // console.log('totalProductSelected: ' + totalProductSelected + ' | ' + 'totalProductQuantity: ' + totalProductQuantity);

        if (totalProductSelected < totalProductQuantity) {
          var totalToAdd = totalProductQuantity - totalProductSelected;
          // console.log('totalToAdd', totalToAdd);
          for (var i = 0; i < totalToAdd; ++i) {
            scentChoices.push(squatchPick);   
          } 
        }
        
        var scentChoicesQuantity = scentChoices.map(function(scent) {
            var scentQuantity = scent.get('qty');
            if(scentQuantity > 1) {
              for (var i = 0; i < scentQuantity - 1; ++i) {
                scentChoices.push(scent);   
              }   
            }
        });
        
        console.log('scents', scentChoices);

        for (var i = 0; i < scentChoices.length; ++i) {
            metadata[key.replace("_IDX_", i + 1)] = scentChoices[i].get('sku');
        }
        return metadata;
    },
    submitClicked: function(event) {
        event.preventDefault();
        $(".loading").html("Hang on a sec, Squatch is prepping your order.").addClass("active");
        var data = {};
        data.products = [];

        data.products.push({
            product_id: this.model.get('selected_product').id,
            term_cycles: 1,
            quantity: 1
        });

        data.products.push({
            product_id: this.model.get('selected_hair_product').id,
            term_cycles: 1,
            quantity: this.model.get('selected_hair_product').qty
        });

        _.each(this.addonsView.getAddonChoices(), function(product) {
            data.products.push({
                product_id: product.id,
                term_cycles: product.is_single_purchasable ? null : 1,
                quantity: 1
            });
        });

        data.products[0]['metadata'] = this.getChosenScentMetadata();
        // console.log('data', data);
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
$('.subscribe_btn').click(function() { $(window).scrollTop($(".panel-collapse.collapse.in").offset().top - 90); });
var subscribeView = new SubscribeView({ model: new SubscribeModel() });

subscribeView.render();