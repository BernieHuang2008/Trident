// generate a class called Trident

class Trident {
	constructor(div) {
		this.div = div;
		this.div.innerHTML = "";
		this.config = {
			resolution: [window.innerWidth, window.innerHeight], // [browser_width, browser_height]px
			zoom_ratio: Math.min(window.innerWidth / 297, window.innerHeight / 210),

			// Refer to the 'geometry' package, see https://www.overleaf.com/learn/latex/Page_size_and_margins for detail.
			paper_size: [297, 210], // [width, height] mm
			margin: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0
			] // [textwidth, textheight, total, left, lmargin, inner, right, rmargin, outer, top, tmarginbottom, bmargin, headheight, headsep, footnotesep, footskip, marginparwidth, marginpar] mm
		}
	}

	_new_page() {
		var canvas = document.createElement("canvas");
		canvas.innerText = "You Browser doesn't support CANVAS!";
		canvas.width = this.config.zoom_ratio * this.config.paper_size[0];
		canvas.height = this.config.zoom_ratio * this.config.paper_size[1];
		this.div.appendChild(canvas);
	}

	_normalizeCode(code) {
		[
			[/(\\[^\s]+? )([\{|\[])/g, function(a, b, c) {
				if (b.match(/\\TRIDENTCOMMAND_/g))
					return a;
				return b.replaceAll(/\s/g, '') + c;
			}], // remove space between command and bracket
			[/\%.+?\n/g, '\n'], // remove comments
			['\n\n', '\\TRIDENTCOMMAND_NEWLINE'], // replace empty lines to special command
			['\\\\', '\\newline'], // replace \\ with \newline
			[/\$\$(.+?)\$\$/g,
				" \\begin{equation} $1 \\end{equation} "
			], // replace $$...$$ with \begin{equation} ... \end{equation}
			[/\s+/g, ' '], // replace multiple spaces with single space
			[/\\ /g, '\\TRIDENTCOMMAND_SPACE'], // replace spaces with special command
			['\\#', '\\TRIDENTCOMMAND_HASHTAG'], // replace # with special command
			['\\$', '\\TRIDENTCOMMAND_DOLLAR'], // replace $ with special command
			['\\%', '\\TRIDENTCOMMAND_PERCENT'], // replace % with special command
			['\\^', '\\TRIDENTCOMMAND_CARET'], // replace ^ with special command
			['\\&', '\\TRIDENTCOMMAND_AND'], // replace & with special command
			['\\_', '\\TRIDENTCOMMAND_UNDERLINE'], // replace _ with special command
			['\\{', '\\TRIDENTCOMMAND_LEFTBRACE'], // replace { with special command
			['\\}', '\\TRIDENTCOMMAND_RIGHTBRACE'], // replace } with special command
			['\\[', '\\TRIDENTCOMMAND_LEFTBRACKET'], // replace [ with special command
			['\\]', '\\TRIDENTCOMMAND_RIGHTBRACKET'], // replace ] with special command
			['\\(', '\\TRIDENTCOMMAND_LEFTPARENT'], // replace ( with special command
			['\\)', '\\TRIDENTCOMMAND_RIGHTPARENT'], // replace ) with special command
			['~', '\\TRIDENTCOMMAND_SPACE'], // replace ~ with space command
			[/\s+/g, ' '], // replace multiple spaces with single space again
		].forEach(x => {
			if ((typeof x[1]) == 'string')
				code = code.replaceAll(x[0], ' '+x[1] + ' ');
			else
				code = code.replaceAll(x[0], x[1]);
		})
		return code;
	}

	_parseCode(code) {
		var i = 0;
		const command_char = /[a-z]|[A-Z]|_|{|}|\[|\]/g;
		const command_bracket = /\[|{/g;
		const command_close_bracket = /\]|}/g;

		function parseCommand() {
			var command = '\\';
			i++;
			var brackets = '';
			var bracketed = 0;
			while (1) {
				if (code[i].match(command_char) == null && brackets == '')
					break;
				if (bracketed && brackets=='' && !code[i].match(command_bracket))
					break;
				command += code[i];
				if (code[i].match(command_bracket)) {
					bracketed = 1;
					var ch = String.fromCharCode(code[i].charCodeAt() + 2);
					brackets += ch;
				} else if (code[i].match(command_close_bracket)) {
					if (code[i] == brackets[brackets.length - 1]) {
						brackets = brackets.slice(0, brackets.length - 1);
					} else {
						throw `LaTeX Compile Error: Unmatched Brackets '${code[i]}' at position ${i}: ${code.slice(i - 30, i)}`;
					}
				}
				i++;
			};
			return command;
		}

		var tokens = [];
		var token = ""

		for (i = 0; i < code.length; i++) {
			if (code[i] == "\\") {
				if (token.replaceAll(/\s/g, ''))
					tokens.push(token.replaceAll(/\s/g, ''));
				token = "";
				var command = parseCommand();
				tokens.push(command);
			}
			token += code[i];
		}

		return tokens;
	}

	reparse(code) {
		code = this._normalizeCode(code);
		console.log(code);
		code = this._parseCode(code);

		console.log(code);
	}
}
