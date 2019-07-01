/* global jQuerySafe */

jQuerySafe(function($) {
	/* Create a dot for each slide in a slider */
	function createDots($slider) {
		var $dotContainer = $slider.find('.js_dots')
		if ($dotContainer.length === 0) return

		// Generate one dot for each slide
		$slider.find('.js_slides').children().each(function(i, slide) {
			var $dot = $('<li />')
			if (i === 0) $dot.addClass('active')
			$dotContainer.append($dot)
			$dot.on('click', function() { $slider.data().lory.slideTo(i) })
		})

		// Update the active dot whenever the slide changes
		$slider[0].addEventListener('after.lory.slide', function(event) {
			var activeIndex = event.detail.currentSlide
			$dotContainer.children().each(function(i, dot) {
				$(dot).toggleClass('active', activeIndex === i)
			})
		})
	}

	/* Focus $slider on the slide that has the selected product */
	function slideToActiveProduct($slider) {
		var loryInstance = $slider.data().lory
		if (!loryInstance) return

		var $activeButton = $slider.find('.actions [class*="subscription-selected"]')
		var activeSlideIndex = $slider.find('.actions button').index($activeButton) || 0
		loryInstance.reset()
		loryInstance.slideTo(activeSlideIndex) // Required to sync slide dots
	}

	// Initialize all sliders
	$('[data-transform="slider"]').each(function(i, slider) {
		var $slider = $(slider)
		$slider.lory()
		createDots($slider)
		slideToActiveProduct($slider)
	})

	// Slide to the active product whenever a new tab is focused
	$('#step-tab-nav').on('shown.bs.tab', function(event) {
		var $activeTab = $(event.target.getAttribute('href'))
		var $slider = $activeTab.find('[data-transform="slider"]')
		if ($slider.length) slideToActiveProduct($slider)
	})
})