
 $(function(){
    var submitContactForm = function(e){
    	var $frm = $(e.target).closest('form');
      	var $inputs = $frm.find("input");
      	
      	var needsInput = _.any($inputs, function(input){
      		return $(input).val().trim() === "";    
        });
      
      	if (needsInput){
            event.preventDefault();
        }
      	else{
        	$frm.submit(); 
        }
    };
    
    $(document).on("click", ".btn-contact-submit", submitContactForm);
  });
