/**
 * Project Name: Dr. Squatch | Review Excerpt
 * Author: Lucas Bittar Magnani
 * Created: 20160501
 */

(function() {

    var reviewsContainer = jQuerySafe('#reviews_excerpt');
    var reviewTemplate = jQuerySafe('#product_review');

    jQuerySafe('.b-product').each(function() {
      	getReviews($(this));
    });
  
  	function getReviews($currProduct) {
      
      var xhr = new XMLHttpRequest();
      var productId = $currProduct.attr('data-product-id');
      var devURL = 'https://drsquatch.com/shop/product/' + productId + '?preview=1&hide_banner=true&preview_theme_listing_id=147707737&avgrating=1';
      var prodURL = 'https://drsquatch.com/shop/product/' + productId + '?avgrating=1';

      xhr.open('GET', prodURL, true);

      xhr.onload = function(e) {
        
        if (this.status == 200) {
          
          var blob = this.response;

          jQuerySafe.ajax({
            url: '/shop/product_reviews/' + productId,
            dataType: 'json',
            contentType: 'application/json',
            method: 'POST',
            data: JSON.stringify({cursor: 0 }),
            success: function(res) {

            if (res.num_reviews > 0) {

              var review = {
                num_reviews: res.num_reviews,
                avg_rating: blob
              }

              var template = reviewTemplate.html();             
              var generatedTemplate = _.template(template);
              var html = generatedTemplate(review);

              $currProduct.find('#reviews_excerpt').append(html);

              jQuerySafe('.product-rating').raty({
                score: function(){
                  return $(this).attr('data-score');
                },
                readOnly: true,
                starType: 'i',
                hints: null
              });

            } else {

              $currProduct.find('#reviews_excerpt').append('<span class="no-reviews">No reviews</span>');  

            }

          },
              error: function(res) {
                  console.error(res);
              }
          });
          
        } else {
         
          $currProduct.find('#reviews_excerpt').append('<span class="no-reviews">No reviews</span>');  
          
        }
      };

      xhr.send();
      
    }
  
}());