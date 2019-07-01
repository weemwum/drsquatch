<script type="text/javascript" src="//static.criteo.net/js/ld/ld.js" async="true"></script>
<script>

var site_type = /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? "m" : /iPad/.test(navigator.userAgent) ? "t" : "d";
window.criteo_q = window.criteo_q || [];
window.criteo_q.push(
{ event: "setAccount", account: 22076},
{ event: "setSiteType", type: site_type},
{% if guest == false %}
{ event: "setEmail", email: ["{{ customer.email }}"]},
{% endif %}
{ event: "manualFlush"});

var global;
var pageName = '{{slug}}';
switch(pageName)
{
  
  case 'index':
    window.criteo_q.push({event: "viewHome" },{event: 'flushEvents'});
  break;  
    
  case 'collections':
    if(productlist)
    window.criteo_q.push({event: "viewList", item: productlist },{event: 'flushEvents'});
  break;
     
  case 'shop/product':
  
    {% if product is not undefined %}
    window.criteo_q.push({event: "viewItem", item: '{{product.id}}' },{event: 'flushEvents'});
     {% endif %}
  break;
   
  case 'subscription':
      window.criteo_q.push({event: "viewItem", item: '1', soapscribe: 1 },{event: 'flushEvents'});
  break;
      
  case 'giftbox':
      window.criteo_q.push({event: "viewItem", item: '73715486' },{event: 'flushEvents'});
  break;
      
  case 'checkout':
    var criteoCartx = [];  
    var cartItems2x = cartView.getCartProducts();
    for(i=0;i<cartItems2x.length;i++)
      criteoCartx.push({id:cartItems2x[i].product_id, price:cartItems2x[i].price, quantity:cartItems2x[i].quantity});
    window.criteo_q.push({event: "viewBasket", item: criteoCartx },{event: 'flushEvents'});
  break;
      
  case 'customer':
  if (window.location.pathname == '/customer/thank_you'){
    {% if order is not undefined %}
    var criteoTrans = [];
    var hasSub = 0;
    
    {% for cart_prod in order.products %}
    {% if cart_prod.subscription_type_term %}
    hasSub = 1;
    {% endif %}
    //var global = '{{ cart_prod | safe  }}' ;

  
    
    criteoTrans.push({id:'{{cart_prod.instance.id}}',price:{{cart_prod.price}}/{{cart_prod.quantity}}/100 , quantity: '{{cart_prod.quantity}}'});
    {% endfor %}
    if(hasSub==1)
      window.criteo_q.push({event: "trackTransaction", id: '{{ order.id }}', soapscribe: 1,  item: criteoTrans },{event: 'flushEvents'});
    else
       window.criteo_q.push({event: "trackTransaction", id: '{{ order.id }}', item: criteoTrans },{event: 'flushEvents'});
     {% endif %}
  }
  break;
      
 
}
$('.ecom-add-to-cart').on('click',function(){
  setTimeout(function(){ 
    var criteoCart = [];  
    var cartItems2 = cartView.getCartProducts();
    for(i=0;i<cartItems2.length;i++)
      criteoCart.push({id:cartItems2[i].product_id, price:cartItems2[i].price, quantity:cartItems2[i].quantity});
    window.criteo_q.push({event: "viewBasket", item: criteoCart },{event: 'flushEvents'});
  }, 200);
});     


</script>