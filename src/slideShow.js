// universal timer
function Timer(t,i){var n,e,o=!1,u=t,s=i;this.pause=function(){o=!0,n&&window.clearTimeout(n),s-=new Date-e},this.restart=function(t){void 0!==t&&(u=t),n&&window.clearTimeout(n),s=i,this.play()},this.play=function(){o=!1,e=new Date,n=window.setTimeout(u,s)},this.getTime=function(){return s},this.isPaused=function(){return o},this.play()}

/**
 * Jquery Slide Show - fade works on absolute only
 *
 * @author DaVee8k
 * @version 0.35.1
 * @license WTFNMFPL 1.0
 */
(function ($) {
	$.fn.slideShow = function (option) {
		var self = this;
		this.page = option['page'] !== undefined ? option['page'] : 'a';
		this.classCurrent = option['classCurrent'] !== undefined ? option['classCurrent'] : false;
		this.classOn = option['classOn'] !== undefined ? option['classOn'] : "active";
		this.classOff = option['classOff'] !== undefined ? option['classOff'] : false;
		this.arrows = option['arrows'] !== undefined ? option['arrows'] : false;
		this.pager = option['pager'] !== undefined ? option['pager'] : false;
		this.effect = option['effect'] !== undefined ? option['effect'] : "fade";
		this.pause = option['pause'] !== undefined ? option['pause'] : 5000;
		this.duration = option['duration'] !== undefined ? option['duration'] : 600;
		this.timer = false;
		this.playing = true;
		this.pages = Array();
		this.current = 0;
		this.count = 0;

		this.init = function () {
			this.pages = $(this).find(this.page);
			this.count = this.pages.length;
			return this.count > 1;
		};

		this.loadPageData = function (current) {
			var data = $(this.pages[current]).data("slideshow");
			if (data) {
				if (data['pause'] === 0) this.playing = false;
				if (data['action'] !== undefined) window[data['action']]();
			}
		};

		this.createArrows = function (element, elClass) {
			if ($("#" + element).length === 0) {
				$(this).after('<div id="' + element + '"><a href="#" class="' + elClass + '-left"></a><a href="#" class="' + elClass + '-right"></a></div>');
			}
			$("#" + element).find('.' + elClass + '-left').click( function () { return self.showNext(false); });
			$("#" + element).find('.' + elClass + '-right').click( function () { return self.showNext(true); });
		};

		this.createPager = function (element, elClass) {
			if ($("#" + element).length === 0) {
				$(this).after('<div id="' + element + '"' + (elClass ? ' class="' + elClass + '"' : '') + '></div>');
				for (var i = 0; i < this.count; i++) {
					$("#" + element).append('<a href="#"><span>' + (i+1) + '</span></a>');
				}
				$("#" + element).children("a").eq(this.current).addClass("select");
			}
			// add actions
			for (var i = 0; i < this.count; i++) {
				$($('#' + element).find("a").eq(i)).click( function () {
					self.showNum($(this).children('span').text()-1);
					return false;
				});
			}
			// pause timer on hover
			if (this.pause) {
				$("#" + element).hover(
					function () { self.timer.pause(); $(this).addClass("ie-fix-slider-hover"); },
					function () { if (self.playing) self.timer.play(); $(this).removeClass("ie-fix-slider-hover"); }
				);
			}
		};

		/**
		 * Pick next slide based on direction
		 * @param {Boolean} direction
		 * @returns {Boolean}
		 */
		this.showNext = function (direction) {
			var next = this.current + (direction ? 1 : -1);
			if (next < 0) next = this.count - 1;
			else if (next >= this.count) next = 0;
			this.showNum(next);
			return false;
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

		this.changeSlide = function (next) {
			var last = this.current;
			this.current = next;
			this.playing = true;
			this.loadPageData(this.current);

			if (this.timer) {
				if (this.playing === true) this.timer.restart();
				else this.timer.pause();
				if (this.pager && $("#"+this.pager).hasClass("ie-fix-slider-hover")) this.timer.pause();
			}
			if (this.pager) this.changeDot(this.current);
			if (this.classOff) $(this.pages[last]).addClass(this.classOff);
			if (this.classOn) $(this.pages[this.current]).addClass(this.classOn);
			if (this.classCurrent) {
				$(this.pages[last]).removeClass(this.classCurrent);
				$(this.pages[this.current]).addClass(this.classCurrent);
			}

			var isRelative = $(this.pages[last]).css('position') === 'relative';
			var direction = (this.current > last && !(last === 0 && this.current === self.count - 1)) || (this.current === 0 && last === self.count - 1);
			// disable for relative position - imposible to use effect correctly
			if (this.effect === 'toggle' || isRelative) {
				if (!this.classCurrent) $(this.pages[this.current]).show();
				setTimeout(function () { self.changeFinish(self.pages[self.current], last); }, isRelative ? 0 : this.duration);
			}
			else if (this.effect === 'slide') {
				var position = direction ? $(this).width() : -$(this).width();
				$(this.pages[last]).animate({left: position + 'px'}, this.duration);
				$(this.pages[this.current]).css('left', -position + 'px').show().animate({left: 0}, this.duration, function () {
					self.changeFinish(this, last);
					$(self.pages[last])[0].style.left = null;
				});
			}
			else if (this.effect === 'drop') {
				var position = direction ? $(this).height() : -$(this).height();
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

		this.changeFinish = function (showEl, last) {
			if (this.effect !== 'toggle' || !this.classCurrent) $(this.pages[last]).hide();
			if (this.classOff) $(this.pages[last]).removeClass(this.classOff);
			if (this.classOn) $(showEl).removeClass(this.classOn);
		};

		this.changeDot = function (current) {
			$("#" + this.pager).find("a.select").removeClass("select");
			$("#" + this.pager).find("a:nth-child(" + (current + 1) + ")").addClass("select");
		};

		if (this.init()) {
			this.loadSrc(this.pages[this.current], null);
			this.loadPageData(this.current);
			if (this.arrows !== false) this.createArrows(this.arrows, option['arrowsClass'] !== undefined ? option['arrowsClass'] : 'slider-arrow');
			if (this.pager !== false) this.createPager(this.pager, option['pagerClass'] !== undefined ? option['pagerClass'] : false);
			if (this.effect !== 'toggle' || !this.classCurrent) $(this).find(this.page).slice(1).hide();
			if (this.classCurrent && !$(this.pages[this.current]).hasClass(this.classCurrent)) $(this.pages[this.current]).addClass(this.classCurrent);
			if (this.pause) {
				this.timer = new Timer(function(){ self.showNext(true); }, this.pause);
				if (this.playing === false) this.timer.pause();
			}
		};

		// public functions
		return {
			showNum: function (num) { self.showNum(num); },
			showNext: function (direction) { self.showNext(direction); }
		};
	};
}(jQuery));