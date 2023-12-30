// universal timer
function Timer(t,i){var n,e,o=!1,u=t,s=i;this.pause=function(){o=!0,n&&window.clearTimeout(n),s-=new Date-e},this.restart=function(t){void 0!==t&&(u=t),n&&window.clearTimeout(n),s=i,this.play()},this.play=function(){o=!1,e=new Date,n=window.setTimeout(u,s)},this.getTime=function(){return s},this.isPaused=function(){return o},this.play()}

/**
 * jQuery SlideShow
 *
 * @author DaVee8k
 * @version 0.36.1
 * @license WTFNMFPL 1.0
 */
(function ($) {
	$.fn.slideShow = function (option) {
		var self = this;
		this.page = option['page'] !== undefined ? option['page'] : 'a';
		this.classActive = option['classActive'] !== undefined ? option['classActive'] : null;
		this.classOn = option['classOn'] !== undefined ? option['classOn'] : null;
		this.classOff = option['classOff'] !== undefined ? option['classOff'] : "slide-off";
		this.effect = option['effect'] !== undefined ? option['effect'] : "fade";
		this.pause = option['pause'] !== undefined ? option['pause'] : 5000;
		this.duration = option['duration'] !== undefined ? option['duration'] : 1200;

		this.elmArrow = null;
		this.elmPager = null;
		this.pages = Array();
		this.current = 0;
		this.count = 0;
		this.timer = null;
		this.playing = true;

		/**
		 *
		 * @returns {Boolean}
		 */
		this.init = function () {
			this.pages = $(this).find(this.page);
			this.count = this.pages.length;
			return this.count > 1;
		};

		/**
		 * Load settings for pages
		 * @param {type} current
		 * @returns {undefined}
		 */
		this.loadPageData = function (current) {
			var data = $(this.pages[current]).data("slideshow");
			if (data) {
				if (data['pause'] === 0) this.playing = false;
				if (data['action'] !== undefined) window[data['action']]();
			}
		};

		/**
		 * Create arrows
		 * @param {String} element
		 * @param {String} elClass
		 */
		this.createArrows = function (element, elClass) {
			if (!element || $("#" + element).length === 0) {
				this.elmArrow = $('<div' + (element ? ' id="' + element + '"' : '') + ' class="' + elClass + '">' +
					'<a href="#" class="' + elClass + '-left"></a><a href="#" class="' + elClass + '-right"></a></div>');
				$(this).after(this.elmArrow);
			}
			else if (element) {
				this.elmArrow = $("#" + element);
			}

			// add actions
			$(this.elmArrow).find('.' + elClass + '-left').click( function (e) {
				e.preventDefault();
				self.showNext(false);
			});
			$(this.elmArrow).find('.' + elClass + '-right').click( function (e) {
				e.preventDefault();
				self.showNext(true);
			});
		};

		/**
		 * Create pager
		 * @param {String} element
		 * @param {String} elClass
		 */
		this.createPager = function (element, elClass) {
			if (!element || $("#" + element).length === 0) {
				this.elmPager = $('<div' + (element ? ' id="' + element + '"' : '') + (elClass ? ' class="' + elClass + '"' : '') + '></div>');
				for (var i = 0; i < this.count; i++) {
					$(this.elmPager).append('<a href="#"><span>' + (i+1) + '</span></a>');
				}
				$(this.elmPager).find("a:nth-child(" + this.current + 1 + ")").addClass("active");
				$(this).after(this.elmPager);
			}
			else if (element) {
				this.elmPager = $("#" + element);
			}

			// add actions
			$(this.elmPager).find("a").click( function (e) {
				var num = Number.parseInt($(this).children('span').text()) - 1;
				e.preventDefault();
				self.showNum(num);
			});
			this.initPause(this.elmPager);
		};

		/**
		 * Pause timer on hover
		 * @param {DOMelement} element
		 */
		this.initPause = function (element) {
			if (this.pause) {
				$(element).hover(
					function () { self.timer.pause(); },
					function () { self.timer.play(); }
				);
			}
		};

		/**
		 * Pick next slide based on direction
		 * @param {Boolean} direction
		 */
		this.showNext = function (direction) {
			var next = this.current + (direction ? 1 : -1);
			if (next < 0) next = this.count - 1;
			else if (next >= this.count) next = 0;
			this.showNum(next);
		};

		/**
		 * Prepare for next slide
		 * @param {int} next
		 * @returns {Boolean}
		 */
		this.showNum = function (next) {
			if (next === this.current || next >= this.count) return false;
			// stop active events
			$(this.pages[this.current]).stop(true, true);
			if (this.timer) this.timer.pause();

			var nextSlide = this.pages[next];
			var background = $(nextSlide).data("src");
			var src = $(nextSlide).find("img").data("src") || $(nextSlide).find("img").attr("src");

			if (background !== undefined || src) {
				this.loadSrc(nextSlide, function () { self.changeSlide(next); });
			}
			else this.changeSlide(next);
			return true;
		};

		/**
		 * Image lazyload base on
		 * @param {Element} slide
		 * @param {function} callback
		 */
		this.loadSrc = function (slide, callback) {
			var background = $(slide).data("src");
			var imgList = $(slide).find("img");

			if (background !== undefined) {
				// set div background
				var img = new Image();
				$(slide).removeAttr("data-src").removeData("src");
				$(img).one("load", function () {
					$(slide).css("background-image", 'url("' + background + '")');
					if (callback) callback();
				}).attr("src", background);
			}
			else if (imgList) {
				// load image src
				var counter = $(imgList).length;
				for (var i = 0; i < $(imgList).length; i++) {
					var img = $(imgList).get(i);
					var src = $(img).data("src") || $(img).attr("src");
					$(img).removeAttr("loading");	// force ff to load

					img.onload = function () {
						$(this).removeAttr("data-src").removeData("src");
						if (--counter === 0 && callback) callback();
					};
					img.onerror = function () {
						if (--counter === 0 && callback) callback();
					};
					img.src = src;
				};
			}
		};

		/**
		 * Change to selected slide
		 * @param {type} next
		 * @returns {undefined}
		 */
		this.changeSlide = function (next) {
			var last = this.current;
			$(this.pages[last]).stop(true, true);
			$(this.pages[next]).stop(true, true);

			this.current = next;
			this.playing = true;
			this.loadPageData(this.current);

			if (this.timer) {
				if (this.playing === true) this.timer.restart();
				else this.timer.pause();
			}
			if (this.elmPager) this.changeDot(this.current);
			if (this.classOff) $(this.pages[last]).addClass(this.classOff);
			if (this.classOn) $(this.pages[this.current]).addClass(this.classOn);
			if (this.classActive) {
				$(this.pages[last]).removeClass(this.classActive);
				$(this.pages[this.current]).addClass(this.classActive);
			}

			var isRelative = $(this.pages[last]).css('position') === 'relative';
			var direction = (this.current > last && !(last === 0 && this.current === self.count - 1)) || (this.current === 0 && last === self.count - 1);
			// disable for relative position - imposible to use effect correctly
			if (this.effect === 'toggle' || isRelative) {
				if (!this.classActive) $(this.pages[this.current]).show();
				setTimeout(function () { self.changeFinish(self.pages[self.current], last); }, isRelative ? 0 : this.duration);
			}
			else if (this.effect === 'slide') {
				var position = $(this).width() * (direction ? 1 : -1);
				$(this.pages[last]).animate({left: position + 'px'}, this.duration);
				$(this.pages[this.current]).css('left', -position + 'px').show().animate({left: 0}, this.duration, function () {
					self.changeFinish(this, last);
					$(self.pages[last])[0].style.left = null;
				});
			}
			else if (this.effect === 'drop') {
				var position = $(this.pages[this.current]).height() * (direction ? 1 : -1);
				$(this.pages[last]).animate({top: position + 'px'}, this.duration);
				$(this.pages[this.current]).css('top', -position + 'px').show().animate({top: 0}, this.duration, function () {
					self.changeFinish(this, last);
					$(self.pages[last])[0].style.top = null;
				});
			}
			else {
				$(this.pages[this.current]).fadeIn(this.duration, function () { self.changeFinish(this, last); });
			}
		};

		/**
		 * Remove additional classes and hide previous slide
		 * @param {DOMelement} showEl
		 * @param {Integer} last
		 */
		this.changeFinish = function (showEl, last) {
			if (!this.classActive) $(this.pages[last]).hide();
			if (this.classOff) $(this.pages[last]).removeClass(this.classOff);
			if (this.classOn) $(showEl).removeClass(this.classOn);
		};

		/**
		 * Change active item in pager
		 * @param {Integer} current
		 */
		this.changeDot = function (current) {
			$(this.elmPager).find("a.active").removeClass("active");
			$(this.elmPager).find("a:nth-child(" + (current + 1) + ")").addClass("active");
		};

		if (this.init()) {
			this.loadSrc(this.pages[this.current], null);
			this.loadPageData(this.current);

			if (option['arrows'] !== undefined && option['arrows'] !== false) this.createArrows(typeof option['arrows'] === "boolean" ? "" : option['arrows'], option['arrowsClass'] !== undefined ? option['arrowsClass'] : 'slider-arrows');
			if (option['pager'] !== undefined && option['pager'] !== false) this.createPager(typeof option['pager'] === "boolean" ? "" : option['pager'], option['pagerClass'] !== undefined ? option['pagerClass'] : null);
			if (!this.classActive) $(this).find(this.page).slice(1).hide();
			if (this.classActive && !$(this.pages[this.current]).hasClass(this.classActive)) $(this.pages[this.current]).addClass(this.classActive);
			if (this.pause) {
				this.timer = new Timer(function(){ self.showNext(true); }, this.pause);
				if (this.playing === false) this.timer.pause();
			}
		};

		// public functions
		return {
			getCurrent: function () { return self.current; },
			getCount: function () { return self.count; },
			pause: function () { if (self.pause) self.timer.pause(); },
			play: function () { if (self.pause) self.timer.play(); },
			showNum: function (num) { self.showNum(num); },
			showNext: function (direction) { self.showNext(direction); }
		};
	};
}(jQuery));
