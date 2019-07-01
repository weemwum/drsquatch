window.sendShopMsgUpdate = function() {
  if(typeof _shopmsg !== 'undefined') {
    $.get("/components/ajax-shopmessage-cart" + location.search)
      .success(function(data) {
      try {
        data = JSON.parse(data);
        var buyUrl = data.products.map(function(d) {
          return d.sku + '~' + d.quantity + '+'
        }).join('');
        buyUrl.slice(0,buyUrl.length -1);
        
        var shopmsgData = {
          "total_price" : document.getElementById('cart-sub-total-price').innerHTML,
          "cta_url" : buyUrl || "https://drsquatch.com", //Add products as query params to URL
          "items" : data.products
        };
        console.log(shopmsgData);
        _shopmsg('trigger', 'UpdateCart', shopmsgData);
      } catch(e) {
        console.log('Error parsing shopmessage data', e);
      }
    })
  }
}

var cartItems = cartItems || [];
var cartAvailableProducts = cartAvailableProducts || [];
var CartProduct = BBSafe.Model.extend({});
var CartProducts = BBSafe.Collection.extend({ model: CartProduct });
var CartModel = BBSafe.Model.extend({});

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

////////////////////////
/// CART PRODUCT VIEW///
////////////////////////
var CartProductView = TemplatedView.extend({
  events: {
    "click .btn-quantity-increase": "quantityIncrease",
    "click .btn-quantity-decrease": "quantityDecrease",
    "click .btn-cart-product-remove": "removeCartProduct"
  },
  template_id: "#selected_cart_item_template",
  quantityIncrease: function(){
    this.model.set('quantity', this.model.get('quantity') + 1);
    this.updatePrice();
    BBSafe.trigger("cartProduct:priceUpdated", this.model);
  return false;
  },
  quantityDecrease: function(){
    var qty = this.model.get('quantity');
    if (qty > 1){
      qty -= 1;
      this.model.set('quantity', qty);
      this.updatePrice();
      BBSafe.trigger("cartProduct:priceUpdated", this.model);
    }
    return false;
  },
  removeCartProduct: function(){
    BBSafe.trigger("cartProduct:removed", this.model);
    BBSafe.trigger("cartProduct:priceUpdated", this.model);
  },
  updatePrice: function(){
    var price = this.model.get('quantity') * this.model.get('unit_price');
    var price_text = "$" + (price/100.0).toFixed(2);
    this.model.set('total_price', price);
    this.model.set('total_price_text', price_text);
  }
});


var CartProductsView = BBSafe.View.extend({
  el: $("#cart-item-holder"),
    initialize: function(){
    _.bindAll(this, "render");

    this.listenTo(BBSafe, "cartProduct:removed", this.removeCartProduct);
  },
  render: function(updatePrice){
    this.cartProductViews = [];
    this.$el.empty();

    _.each(this.model.models, function(cartProduct){
      var cartProductView= new CartProductView({
        model: cartProduct
      });
      cartProductView.render();
      this.$el.append(cartProductView.el);
      this.cartProductViews.push(cartProductView);
    }, this);

    if (updatePrice){
      BBSafe.trigger("cartProduct:priceUpdated");
    }
  },
  removeCartProduct: function(cartProduct){
    this.model.remove(cartProduct);
    this.render();
  },
  addItem: function(product_data){
    var existing = this.model.findWhere({ product_id: product_data.product_id });
    if (existing){
      _.each(this.cartProductViews, function(view){
        if(view.model === existing){
          view.quantityIncrease();
        }
      });
    }
    else{
      var newCartProductModel = new CartProduct({
          name: product_data.name,
          image: product_data.image,
          single_purchasable: product_data.single_purchasable,
          description: product_data.description,
          product_id: product_data.product_id,
          unit_price: product_data.unit_price,
          total_price: product_data.total_price,
          quantity: product_data.quantity,
          total_price_text: product_data.total_price_text,
          product_id: product_data.product_id,
          metadata: product_data.metadata || null,
          term_cycles: product_data.term_cycles || null
      });

      this.model.add(newCartProductModel);
      this.render(true);
    }
  }
});



////////////////////////
///    CART  VIEW    ///
////////////////////////
var CartView = BBSafe.View.extend({
  el: $(document),
  events: {
    "click .link-update-cart": "updateCart",
    "click .link-checkout": "checkoutCart"
  },
  initialize: function(){
    _.bindAll(this, "render");

    this.$qtyLink = $("#cart-qty-display");
    this.$subtotalPrice = $("#cart-sub-total-price");

    var collectionCartProducts = new CartProducts();
    _.each(cartItems, function(item){ collectionCartProducts.add(item); });


    this.cartProductsView = new CartProductsView({ model: collectionCartProducts });
    this.availableProducts = cartAvailableProducts;
    this.updateTotalPrice(false);
    this.updateTimeoutId = -1;

    this.listenTo(BBSafe, "cartProduct:priceUpdated", this.updateTotalPrice);
    this.listenTo(BBSafe, "newProduct:add", this.addNewProduct);
    this.listenTo(BBSafe, "newProduct:checkout", this.addNewCheckout);
    this.model.on('change', this.render, this);
  },
  render: function(){
    this.cartProductsView.render();
    this.$subtotalPrice.html(this.model.get('total_price_text'));
    this.updateEmptyState();
  },
  updateTotalQty: function(){
    var totalQty = 0;
    _.each(this.cartProductsView.model.models, function(cartProduct){
      totalQty += cartProduct.get('quantity');
    });
    if(totalQty > 0) {
		this.$qtyLink.addClass('items-in-cart');
    }
    this.$qtyLink.text(totalQty);
  },
  updateEmptyState: function(){
    var found = false;
    _.each(this.cartProductsView.model.models, function(cartProduct){
    	if(cartProduct.get('quantity') > 0){
          found = true;
        }
    });
    if (found > 0){
    	$(".hide-if-empty").show();
      	$(".show-if-empty").hide();
    }
    else{
    	$(".show-if-empty").show();
      	$(".hide-if-empty").hide();
    }
  },
  updateTotalPrice: function(updateCart){
    var total_price = 0;
    _.each(this.cartProductsView.model.models, function(item){
      total_price += item.get('total_price');
    });
    this.model.set('total_price', total_price);
    this.model.set('total_price_text', "$" + (total_price/100.0).toFixed(2));
    this.updateTotalQty();
    if (updateCart !== false){
    	this.updateCart();
    }
    this.updateEmptyState();
  },
  getCartProducts: function(){
    var ret = [];

    _.each(this.cartProductsView.model.models, function(cartProduct){
      ret.push({
          product_id: cartProduct.get('product_id'),
            term_cycles: cartProduct.get('single_purchasable') === "True" ? null : (cartProduct.get('term_cycles') || 1),
            quantity: cartProduct.get('quantity'),
            //added by criteo
            price: (cartProduct.get('unit_price')/100),
        	metadata: cartProduct.get('metadata')
        });
    });

    return ret;
  },
  addNewProduct: function(product_id, callback){
    var foundProduct = _.findWhere(this.availableProducts, { product_id: product_id });
    if (foundProduct){
      this.cartProductsView.addItem(foundProduct)
      callback(product_id);     
    }
  },
  addNewCheckout: function(product_id) {
    var self = this;
    self.addNewProduct(product_id, function() {
      self.sendUpdateRequest(true);
    });
  },
  checkoutCart: function(){
    this.updateCart(true);
  },
  updateCart: function(redirect){
    clearTimeout(this.updateTimeoutId);
    var that = this;
    this.updateTimeoutId = setTimeout(function(){ that.sendUpdateRequest(redirect); }, redirect === true ? 0 : 500);
  },
  sendUpdateRequest: function(redirect){
    var data = {};
    var selectedProducts = this.getCartProducts();
    data.products = selectedProducts;
    data.clear_cart = true;
    var endpoint = selectedProducts.length > 0 ? "/cart/add" : "/cart/clear";

    $.ajax({
      type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'json',
        url: endpoint,
        success: function(e){
          window.sendShopMsgUpdate();

          if (redirect === true){
            window.location = '/checkout';
          }
        },
      	error: function(e) {
          console.log('error posting cart update', e);
          window.sendShopMsgUpdate();
        }
    });

    return false;
  },
});

var cartView = new CartView({ model: new CartModel() });
cartView.render();
