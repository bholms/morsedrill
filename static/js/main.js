$(document).ready(function () {
	// Cheatsheet is embedded in index.html to ensure it's always visible.

	// Morse Drill game UI insertion
	const gameHtml = `
		<div id="morse-game" class="morse-center">
			<div class="target-label">Translate the displayed word into Morse</div>
			<div id="target-word">—</div>
			<div id="help-text">Type the Morse sequence for the whole word using the dot and forward slash character on your keyboard as below:</div>
			<div id="instructions" class="inline-instructions">
				<span class="kbd-inline">.</span>
				<span class="instr-sep">&nbsp;=&nbsp;</span>
				<span class="morse-symbol"><span class="morse-dot" aria-hidden="true"></span></span>
				&nbsp;&nbsp;&nbsp;
				<span class="kbd-inline">/</span>
				<span class="instr-sep">&nbsp;=&nbsp;</span>
				<span class="morse-symbol"><span class="morse-dash" aria-hidden="true"></span></span>
			</div>
			<div id="user-seq">Input: <span id="input-display"></span></div>
			<div id="buttons" style="margin-top:8px;">
				<button id="dot-btn" class="btn btn-primary">.</button>
				<button id="slash-btn" class="btn btn-primary">/</button>
				<button id="reset-btn" class="btn btn-default">Reset</button>
				<button id="next-btn" class="btn btn-success">Next</button>
			</div>
			<div id="result"></div>
			<div class="quick-hint">Press <strong>Enter</strong> for next word, <strong>Esc</strong> to reset.</div>
			<div class="example"><span class="example-label">Example:</span> Letter <strong>A</strong> -> <span class="morse-text">.<span class="morse-dash" aria-hidden="true"></span></span></div>
		</div>
	`;

	$(".col-md-7").html(gameHtml);

	const words = ["SOS","TEST","CODE","MORSE","HELP","CAT","DOG","HI","FUN"];

	const MORSE = {
		A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
		I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
		Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
		Y: "-.--", Z: "--.."
	};

	let targetWord = "";
	let targetSeq = ""; // '.' and ',' (comma used for dash)
	let userSeq = "";
	let locked = false;

	function letterToSeq(letter) {
		const code = MORSE[letter.toUpperCase()] || "";
		return code.replace(/-/g, '/');
	}

	function wordToSeq(word) {
		return word.split("").map(letterToSeq).join("");
	}

	function pickWord() {
		const w = words[Math.floor(Math.random() * words.length)];
		return w;
	}

	function setButtons(enabled) {
		$("#dot-btn, #slash-btn").prop('disabled', !enabled);
	}

	function newRound() {
		targetWord = pickWord();
		targetSeq = wordToSeq(targetWord);
		userSeq = "";
		locked = false;
		$("#target-word").text(targetWord);
		// show empty rendered input
		renderUserSeq();
		$("#result").text("").removeClass('win lose');
		setButtons(true);
	}

	function resetInput() {
		userSeq = "";
		locked = false;
		renderUserSeq();
		$("#result").text("").removeClass('win lose');
		setButtons(true);
	}

	function showResult(win) {
		locked = true;
		setButtons(false);
		if (win) {
			$("#result").text('Well done').addClass('win').removeClass('lose');
		} else {
			$("#result").text('Try again').addClass('lose').removeClass('win');
		}
	}

	function checkProgress() {
		// Immediate fail if userSeq doesn't match prefix
		if (!targetSeq.startsWith(userSeq)) {
			showResult(false);
			return;
		}
		if (userSeq.length === targetSeq.length) {
			showResult(true);
		}
		// otherwise still in progress
	}

	// bind buttons
	$(document).on('click', '#dot-btn', function () {
		if (locked) return;
		userSeq += '.';
		renderUserSeq();
		checkProgress();
	});

	$(document).on('click', '#slash-btn', function () {
		if (locked) return;
		userSeq += '/';
		renderUserSeq();
		checkProgress();
	});

	$(document).on('click', '#reset-btn', function () {
		resetInput();
	});

	$(document).on('click', '#next-btn', function () {
		newRound();
	});

	// Keyboard input: '.' for dot and '/' (forward slash) for dash
	// Also: Esc -> reset, Enter -> next
	$(document).on('keydown', function (e) {
		// global shortcuts
		if (e.key === 'Escape') {
			e.preventDefault();
			resetInput();
			return;
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			newRound();
			return;
		}
		if (locked) return;
		if (e.key === '.' || e.key === '/') {
			e.preventDefault();
			userSeq += e.key;
			renderUserSeq();
			checkProgress();
		}
	});

	// Render styled morse symbols in the embedded cheatsheet for better visibility
	function renderCheatsheetSymbols() {
		function renderText(txt) {
			// replace dots and dashes with styled spans
			return txt.split("").map(ch => {
				if (ch === '.') return '<span class="morse-dot" aria-hidden="true"></span>';
				if (ch === '-') return '<span class="morse-dash" aria-hidden="true"></span>';
				if (ch === '/') return '<span class="morse-dash" aria-hidden="true"></span>';
				return ch;
			}).join('');
		}

		// adapt to keyboard-style layout: replace contents of elements with class .morse
		$("#cheatsheet-bottom .morse").each(function () {
			const raw = $(this).text().trim();
			$(this).html('<span class="morse-text">' + renderText(raw) + '</span>');
		});
	}

	// Render user's input sequence as visible morse dot/dash symbols
	function renderUserSeq() {
		function mapChar(ch) {
			if (ch === '.') return '<span class="morse-dot" aria-hidden="true"></span>';
			if (ch === '/') return '<span class="morse-dash" aria-hidden="true"></span>';
			return ch;
		}
		const html = userSeq.split("").map(mapChar).join('');
		$("#input-display").html(html);
	}

	// start
	newRound();
	renderCheatsheetSymbols();
});