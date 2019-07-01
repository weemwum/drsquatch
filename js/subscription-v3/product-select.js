/* global jQuerySafe */

/**
 * Add dropdown functionality to show/hide scents and addons on mobile
 *
 *  <div class="option-list-wrapper" data-options>
 *    <i class="fa fa-caret-right"></i>
 *    <div class="option-list">
 *      <div class="option-item" data-target="#el-1">Option 1</div>
 *      <div class="option-item" data-target="#el-2">Option 2</div>
 *    </div>
 *  </div>
 *
 *  <div id="el-1" data-group="my-group"></div>
 *  <div id="el-2" data-group="my-group"></div>
 *
 * In this example the two dropdown options will show/hide the elements selected by
 * their data-target attributes (#el-1 and #el-2)
 */
jQuerySafe(function($) {
	var OPEN_CLASS = '-open'
	var OPTION_SELECTED_CLASS = '-selected'
	var ITEM_HIDDEN_CLASS = 'hidden-xs hidden-sm'

	function applySelection(option) {
		// Apply selected class to option in dropdown
		var $option = $(option)
		$option.siblings().removeClass(OPTION_SELECTED_CLASS)
		$option.addClass(OPTION_SELECTED_CLASS)

		var $target = $($option.data('target'))
		if (!$target.length) return

		// Apply / remove hidden classes on the elements targeted by the option
		var $targetGroup = $('[data-group="' + $target.data('group') + '"]')
		$targetGroup.addClass(ITEM_HIDDEN_CLASS)
		$target.removeClass(ITEM_HIDDEN_CLASS)
	}

	// Apply a selection whenever an option is clicked
	$('[data-options] [data-target]').on('click', function() {
		applySelection(this)
	})

	// Apply the first option as the selection on load
	$('[data-options] [data-target]:first-child').each(function(i, option) {
		applySelection(option)
	})

	// Toggle the dropdown open class with every click
	$('[data-options]').on('click', function() {
		$(this).toggleClass(OPEN_CLASS)
	})
})
