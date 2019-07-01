/* global jQuerySafe */

function yotpoUrl(productId, endpoint) {
	var url = 'https://api.yotpo.com/products/rovsuhtR01AOZ8Vl90zCBkGot9h5DML2IsoJ9tn3/'
	url += productId + '/' + endpoint
	return url
}

jQuerySafe(function($) {
	/* Parse the content of the Product page and insert it in the modal as fragments */
	function populateAjaxContent($target, $content) {
		var fragments = [
			$content.find('#tabpanel-1 .row'),
			$content.find('#tabpanel-2')
		]
		fragments.forEach(function($fragment) {
			if (!$fragment.length) return
			var $wrapped = $('<div class="fragment"></div>').append($fragment)
			$target.append($wrapped)
		})
	}

	/* Populate star rating and review count from Yotpo */
	function populateYotpoReview($target, score, count) {
		$target.show()
		$target.append(count + ' Reviews')

		var $stars = $target.find('.star-gauge')
		if (!(score && $stars.length)) return // No stars found, bail

		// Generate five star icons; using empty, half, and full stars
		for (var i = 1; i <= 5; score--, i++) {
			var icon = 'fa-star-o'
			if (score >= 0.25) icon = 'fa-star-half-o'
			if (score >= 0.75) icon = 'fa-star'
			$stars.append('<i class="fa ' + icon + '"></i>')
		}
	}

	/* Display the modal and fetch the Product data when clicking modal links */
	$(document).on('click', '[data-ajax-modal]', function(event) {
		event.preventDefault()
		var $modalLink = $(event.target)
		var $modal = $($modalLink.data('ajax-modal'))

		if (!$modal.length) return // Modal not found, bail
		$modal.addClass('-is-visible')
		if ($modal.hasClass('-is-loaded')) return // No need to re-fetch the data

		// Fetch product data
		$modal.addClass('-is-loading')
		$.ajax(event.target.href)
			.done(function(html) {
				populateAjaxContent($modal.find('[data-ajax="content"]'), $(html))
				$modal
					.removeClass('-is-loading')
					.addClass('-is-loaded')
			})

		// Yotpo reviews
		var productId = event.target.href.split('/product/')[1]
		var $reviews = $modal.find('[data-ajax="reviews"]')
		if (!(productId && $reviews.length)) return

		$.ajax(yotpoUrl(productId, 'bottomline'))
			.done(function(json) {
				var score = json.response.bottomline.average_score
				var count = json.response.bottomline.total_reviews
				populateYotpoReview($reviews, score, count)
			})
	})

	/* Handlers to close the modals */
	$(document).on('click', '.product-modal', function(event) {
		// Modal background was clicked
		if (this === event.target) this.classList.remove('-is-visible')

		// Close button was clicked
		if ('close' in event.target.dataset) this.classList.remove('-is-visible')
	})
})