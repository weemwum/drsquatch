jQuerySafe(function($) {
	// Load iframes in place when clicking elements with the data-video attribute
	$('[data-iframe]').on('click', function() {
		var iframe = document.createElement('iframe')
		iframe.src = this.dataset.iframe
		iframe.allow = 'autoplay; fullscreen'
		this.append(iframe)
	})

	$('[data-wistia-id]').on('click', function() {
			const wistia_id = $(this).data('wistia-id');
			$(this).remove();
			Wistia.api(wistia_id).play();
	});
})

if (document.getElementById('raindrop-page')) {
    console.log('Raindrop initialized');
    document.body.classList.add('raindrop');
}

// jQuery('[data-video]').click(function(e){
// 	e.preventDefault();

// 	var video = jQuery(this).attr('data-video');
// 	var embed_modal = jQuery('#video-embed-modal');

// 	embed_modal.find('iframe').attr('src', video);
// 	embed_modal.modal("show");
// });

document.querySelectorAll('[data-video]').forEach(elem => {
	elem.addEventListener('click', e => {
		e.preventDefault();

		if (elem.classList.contains('-video-pop-up')) {
			let video = elem.getAttribute('data-video'),
				modal = document.querySelector('#video-embed-modal');

			modal.querySelector('iframe').src = video;
		} else {
			if (!elem.classList.contains('-iframe-open')) {
				let video_container = e.target.closest('.video-thumbnail-background-video-wrapper'),
				iframe = document.createElement('iframe'),
				video = elem.getAttribute('data-video');

				iframe.src = video;
				iframe.style.width = '100%';
				iframe.style.height = '100%';
				iframe.style.border = 'none';
				video_container.innerHTML = '';
				video_container.appendChild(iframe);
				elem.classList.add('-iframe-open');
			}
		}
	});
});

if (is_mobile()) {
	document.querySelectorAll('[data-video]').forEach(elem => {
		let video_container = elem.querySelector('.video-thumbnail-background-video-wrapper'),
		iframe = document.createElement('iframe'),
		video = elem.getAttribute('data-video');

		iframe.src = video;
		iframe.style.width = '100%';
		iframe.style.height = '100%';
		iframe.style.border = 'none';
		video_container.innerHTML = '';
		video_container.appendChild(iframe);
		elem.classList.add('-iframe-open');
	});
}

jQuery(document).on('hidden.bs.modal','#video-embed-modal', function () {
	jQuery('#video-embed-modal').find('iframe').attr('src', '');
});

if (document.querySelector('#main-masthead-jump')) {
	document.querySelector('#main-masthead-jump').addEventListener('click', e => {
		e.preventDefault();

		let target_top = document.querySelector('#home-callout').offsetTop,
			padding = document.querySelector('.navbar').clientHeight + 20,
			top = target_top - padding;

		window.scroll({
			top: top,
			left: 0,
			behavior: 'smooth'
		});
	});
}

let countdown_clock = {
	elem: document.querySelector('#countdown-timer'),
	targeted_date: 'November 23 2018',
	interval: null,
	initialize() {
		this.interval = setInterval(this.update, 1000);

		setTimeout(function() {
			countdown_clock.elem.style.opacity = 1;
		}, 1000);
	},
	update() {
		let time_left = countdown_clock.calculate_countdown(countdown_clock.targeted_date),
			prepared_string = '';

		Object.keys(time_left).forEach(function(key) {
			if (time_left[key] > 1) {
				prepared_string += time_left[key] +  ' ' + key + ' ';
			} else {
				prepared_string += time_left[key] +  ' ' + key.slice(0,-1) + ' ';
			}
		});

		countdown_clock.elem.innerHTML = prepared_string.slice(0,-1);
	},
	calculate_countdown(endtime){
		let t = Date.parse(endtime) - Date.parse(new Date()),
			seconds = Math.floor( (t/1000) % 60 ),
			minutes = Math.floor( (t/1000/60) % 60 ),
			hours = Math.floor( (t/(1000*60*60)) % 24 ),
			days = Math.floor( t/(1000*60*60*24) );
		return {
		  'days': days,
		  'hrs': hours,
		  'mins': minutes,
		  'secs': seconds,
		};
	}
}

if (document.querySelector('#countdown-timer')) {
	countdown_clock.initialize();
}

function prepare_accordions() {
	document.querySelectorAll('.rd-accordion').forEach((elem, i) => {
		let content = elem.querySelector('.rd-accordion-inner'),
			toggle = elem.querySelector('.rd-accordion-toggle');

		// Pulling the height of the content container and setting it as an attribute..
		elem.setAttribute('data-expanded-height', content.clientHeight);
		content.style.height = '0px';
		content.style.transition = '0.6s';

		// Toggle Function
		toggle.addEventListener('click', e => {
			let accordion = e.target.closest('.rd-accordion'),
				content = accordion.querySelector('.rd-accordion-inner');

			if (is_mobile()) {
				if (accordion.getAttribute('data-expanded') == 'true') {
					content.style.height = '0px';
					accordion.setAttribute('data-expanded', 'false');
				} else {
					content.style.height = accordion.getAttribute('data-expanded-height') + 'px';
					accordion.setAttribute('data-expanded', 'true');
				}
			} else {
				item_popup_open(accordion);
			}
		});
	});
}

window.addEventListener('load', prepare_accordions());

function is_mobile(width) {
	if (width) {
		var i = width;
	} else {
		var i = 768;
	}

	if (window.outerWidth < i) {
	   return true;
	} else {
	   return false;
	}
}

function item_popup_open(accordion) {
	let single = accordion.closest('.holiday-bundle-gift-single'),
		popup = document.querySelector('#item-popup'),
		content = single.querySelector('.holiday-bundle-gift-single-content').innerHTML;

	let item = {
		title: single.querySelector('.holiday-bundle-gift-single-title').innerText,
		subtitle: single.querySelector('.holiday-bundle-gift-single-subtitle').innerText,
		images: single.querySelector('.holiday-bundle-gift-single-images').innerHTML
	}

	popup.querySelector('.item-popup-header h3').innerText = item.title;
	popup.querySelector('.item-popup-header p').innerText = item.subtitle;
	popup.querySelector('.item-popup-left .holiday-bundle-gift-single-images').innerHTML = item.images;

	content += '<button>Add To Cart</button>';

	popup.querySelector('.item-popup-right').innerHTML = content;
	document.querySelector('#item-popup-trigger').click(); // Horrid workaround due to lack of being able to trigger Bootstrap's modal programmatically
}

/**
 * Squatch Slider
 */
document.querySelectorAll('.squatch-horizontal-slide-control').forEach(elem => {
	elem.addEventListener('click', e => {
		squatch_horizontal_slider(e.target.closest('.squatch-horizontal-slider'), elem.getAttribute('data-direction'));
	});
});

function squatch_horizontal_slider(container, direction) {
	let slider = container.querySelector('.squatch-horizontal-slide'),
		slider_width = 250 * slider.children.length;
		transform = {
			pixel_movement: 250,
			cur: parseInt(slider.getAttribute('data-position')),
			min: 0,
			max: ((slider.children.length * 250) - 750) * -1,
		};

	// Slide Transform
	if (!transform.cur) {
		transform.cur = 0;
	}

	if (direction == 'prev') {
		if (transform.cur < transform.min) {
		transform.cur += 250;
		}
	} else {
		if (transform.cur > transform.max) {
		transform.cur -= 250;
		}
	}

	slider.setAttribute('data-position', transform.cur);
	slider.style.transform = 'translateX(' + transform.cur + 'px)';
}
