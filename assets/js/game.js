/*
	class controls gameplay
*/

/*

Mousevent polyfill

*/
(function(window) {
	try {
		new MouseEvent("test");
		return false; // No need to polyfill
	} catch (e) {
		// Need to polyfill - fall through
	}

	// Polyfills DOM4 MouseEvent

	var MouseEvent = function(eventType, params) {
		params = params || { bubbles: false, cancelable: false };
		var mouseEvent = document.createEvent("MouseEvent");
		mouseEvent.initMouseEvent(
			eventType,
			params.bubbles,
			params.cancelable,
			window,
			0,
			0,
			0,
			0,
			0,
			false,
			false,
			false,
			false,
			0,
			null
		);

		return mouseEvent;
	};

	MouseEvent.prototype = Event.prototype;

	window.MouseEvent = MouseEvent;
})(window);

const pinataGame = {
	confetti: null /* array of elems to generate burst */,
	bat: null,
	batRotation: 40 /* deg */,
	body: null,
	pinataBody: null,
	hitPointOffset: {
		top: 0,
		left: 0
	} /* the top part of the bat is higher and lefter than the cursor  */,
	cursorOffset: 0.5,
	sprite: null,
	hitsCount: 0,

	init: function() {
		let self = this;
		this.bat = document.getElementById("the-bat");
		this.body = document.getElementsByTagName("BODY")[0];
		this.pinataBody = document.getElementById("pinataBody");
		this.bat_movement();
		this.confetti = document.getElementsByClassName("particle");
		this.hitSound = new Audio("./assets/audio/hit.mp4");
		this.hooraySound = new Audio("./assets/audio/hooray.mp4");

		for (let i = this.confetti.length - 1; i >= 0; i--) {
			console.log("here it is");
			this.confetti[i].addEventListener(
				"transitionend",
				function(event) {
					this.style.top = "8em";
					this.style.left = "8em";
					let self = this;

					setTimeout(function() {
						self.style.opacity = 0;
					}, 200);
				},
				false
			);
		}

		this.sprite = document.getElementsByClassName("pinata__bat__hit")[0];

		this.sprite.addEventListener("animationend", function(e) {
			this.classList.remove("triggered");
		});

		this.body.addEventListener("click", function(e) {
			if (e.target.tagName !== "A") {
				e.preventDefault();

				if (e.isTrusted === false) {
					if (e.target.classList.contains("bodypart"))
						self.hit_pinata(e);
					else self.miss_pinata(e);
				}

				self.bat_hit(e);
			}
		});
	},

	bat_movement: function() {
		let self = this;

		/* calculating offset to hit only with the top part of the bat */

		let clickOffsetCatets = this.calcCatets(
			this.batRotation,
			this.bat.offsetHeight
		);

		this.hitPointOffset.top = clickOffsetCatets.a * this.cursorOffset;
		this.hitPointOffset.left = clickOffsetCatets.b * this.cursorOffset;

		console.log(clickOffsetCatets);
		this.bat.style.position = "fixed";
		this.bat.style.transform = "rotate(-" + this.batRotation + "deg)";

		this.body.addEventListener("mousemove", function(e) {
			/* correct to have center */
			self.bat.style.top =
				e.pageY - self.bat.offsetHeight * self.cursorOffset + "px";
			self.bat.style.left = e.pageX + "px";
		});
	},
	bat_hit: function(e) {
		let clickOffsetCatets = this.calcCatets(
			this.batRotation,
			this.bat.offsetHeight
		);

		this.hitPointOffset.top = clickOffsetCatets.a * this.cursorOffset;
		this.hitPointOffset.left = clickOffsetCatets.b * this.cursorOffset;

		if (e.isTrusted === true) {
			/* running only on real clicks */

			e.preventDefault();

			console.log(e.pageX - this.hitPointOffset.left);

			let hitPoint = {
				y: e.pageY - this.hitPointOffset.top,
				x: e.pageX - this.hitPointOffset.left
			};

			/*
				recalculate considering transform rotate
			*/
			let self = this;
			console.log("hit");
			setTimeout(function() {
				self.hitSound.play();
			}, 100);
			// document.elementFromPoint(somex, some).click();
			this.doClick(hitPoint.x, hitPoint.y);
		}
	},

	hit_pinata: function() {
		console.log("ouch!");
		this.burst_pinata();
		this.sprite.classList.add("triggered");

		this.hitsCount += 1;

		if (this.hitsCount == 3) {
			this.explode_pinata();
		}
	},
	miss_pinata: function() {
		console.log("ha ha! perdedor!");
	},

	explode_pinata: function() {
		document.getElementById("game-container").classList.add("broken");
		this.hooraySound.play();
	},
	// pendulum_pinata: function(){},
	// show_bonus: function(){},

	burst_pinata: function() {
		for (let i = this.confetti.length - 1; i >= 0; i--) {
			this.confetti[i].style.top = "8em";
			this.confetti[i].style.left = "8em";
			/* assign position and launch */

			this.confetti[i].style.top = this.getRandomArbitrary(6) + "em";
			this.confetti[i].style.left = this.getRandomArbitrary(6) + "em";
			this.confetti[i].style.opacity = 1;

			let self = this;

			setTimeout(function() {
				self.confetti[i].style.opacity = 0;
			}, 200);
		}
	},

	doClick: function(x, y) {
		let el = document.elementFromPoint(x, y);

		if (el) {
			let ev = new MouseEvent("click", {
				view: window,
				bubbles: true,
				cancelable: true,
				hitPinata: true,
				screenX: x,
				screenY: y
			});
			el.dispatchEvent(ev);
		}
	},

	calcCatets: function(angle, c) {
		/* c = hypotenuse */
		let A = angle; // A is sharp - 40
		let B = 90 - angle;
		let catets = {};
		catets.a = Math.round(Math.abs(c * Math.sin(A)));
		catets.b = Math.round(Math.abs(c * Math.cos(A)));
		// catets.c = c;
		// console.log(catets);
		return catets;
	},
	getRandomArbitrary: function(v) {
		// return Math.random() * v - v/2;
		let num = Math.floor(Math.random() * (v * 4)) + v * 0.02; // this will get a number between 1 and 99;
		return num;
	}
};

setTimeout(function() {
	pinataGame.init();
	let theme = new Audio("./assets/audio/bkg.mp4");
	theme.play();
}, 300);

document
	.getElementsByClassName("terms__label")[0]
	.addEventListener("click", function(e) {
		e.preventDefault();
		console.log(this.parentElement);
		this.parentElement.classList.toggle("opened");
	});
