$(document).ready(function() {
  $(".image-pop").on("click", function() {
    var largeImgSrc = $('.inside .left-col img').attr('src')
    $('.inside .left-col img').attr('src', $(this).find('img').attr('src'));
    $(this).find('img').attr('src', largeImgSrc);
  });
});