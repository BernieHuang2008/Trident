// generate a class called Trident

const PT = 0.376; // pt -> mm
var t = 1;

class TridentPen {
	constructor(div, config) {
		this.div = div; // div is a HTMLDivElement which act as a container
		this.config = config; // config is a dictionary object
		this.pages = []; // store all pages in this document (canvas)
	}

	new_page(args) {
		var canvas = document.createElement("canvas");
		canvas.innerText = "You Browser doesn't support CANVAS!";

		canvas.width = this.config.zoom_ratio * this.config.high_dpi * this.config.paper_size[0];
		canvas.height = this.config.zoom_ratio * this.config.high_dpi * this.config.paper_size[1];

		canvas.style.zoom = 1 / this.config.high_dpi;
		canvas.getContext('2d').scale(this.config.zoom_ratio * this.config.high_dpi, this.config.zoom_ratio * this
			.config.high_dpi);

		canvas.id = this.pages.length;
		canvas.classList="Trident-page";
		this.div.appendChild(canvas);
		this.pages.push(canvas);

		if (this.config.pen.page_border) {
			canvas.style.border = `solid ${this.config.pen.page_border} 1px`;
		}

		if (this.config.format_page) {
			this.config.format_page.forEach(command => {
				var cmd_para = command[1];
				var cmd_name = command[0];
				this.config.pen.pos[0] = this.pages.length - 1;
				this[cmd_name](cmd_para);
			});
		}

		this.move_pen([0, 0]);
	}

	move_pen([new_x, new_y]) {
		this.config.pen.pos[1] = this.config.margin[0] + new_x;
		this.config.pen.pos[2] = this.config.margin[2] + new_y;
	}

	_move_pen([new_x, new_y]) {
		// no margin
		this.config.pen.pos[1] = new_x;
		this.config.pen.pos[2] = new_y;
	}

	_ctx() {
		const [page, x, y] = this.config.pen.pos;
		const canvas = this.pages[page];
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = this.config.pen.color;

		return [x, y, ctx];
	}

	set_color([color]) {
		this.config.pen.color = color;
	}

	draw_text([text, font_size]) {
		var [x, y, ctx] = this._ctx();

		ctx.font = `${font_size*0.25}pt ` + this.config.pen.font;
		ctx.fillText(text, x, y);
	}

	draw_arc([radius, startAngle, endAngle, anticlockwise]) {
		var [x, y, ctx] = this._ctx();

		ctx.arc(x, y, radius, startAngle, endAngle, Boolean(anticlockwise));
	}

	draw_rect([width, height]) {
		var [x, y, ctx] = this._ctx();

		ctx.strokeRect(x, y, width, height);
	}

	fill_rect([width, height]) {
		var [x, y, ctx] = this._ctx();

		ctx.fillRect(x, y, width, height);
	}

	clear_rect([width, height]) {
		ctx.clearRect(x, y, width, height);
	}

	svg_stroke([path_str]) {
		var [x, y, ctx] = this._ctx();

		var p = new Path2D(`M${x} ${y} ` + path_str);
		ctx.stroke(p);
	}

	svg_fill([path_str]) {
		var [x, y, ctx] = this._ctx();

		var p = new Path2D(`M${x} ${y} ` + path_str);
		ctx.fill(p);
	}

	_eval([cmd]) {
		var [x, y, ctx] = this._ctx();

		eval(cmd);
	}

	static a4 = {
		zoom_ratio: 1, // change to match your screen size (auto calculated in Trident).
		high_dpi: 5, // Scale for high resulution screen. --- Scale 5 times, and then zoom out 1/5 times, so you get a high-resolution image.
		paper_size: [210, 297], // [width, height] mm
		margin: [20, 20, 20, 20], // [left, right, top, bottom] mm
		pen: {
			page_border: false, // decide whether to draw page border
			pos: [0, 0, 0], // [page, width(x), height(y)] mm
			color: "black", // pen's color
			font: "Times New Roman", // pen's font

		},
		format_page: [
			["_move_pen", [20, 12]],
			["fill_rect", [170, 1 * PT]],
		]
	}
}

class Trident {
	constructor(div) {
		this.div = div;
		this.div.innerHTML = "";
		this.config = {
			resolution: [window.innerWidth, window.innerHeight], // [browser_width, browser_height]px
			zoom_ratio: Math.min(window.innerWidth / 210, window.innerHeight / 297),

			// Refer to the 'geometry' package, see https://www.overleaf.com/learn/latex/Page_size_and_margins for detail.
			paper_size: [210, 297], // [width, height] mm
			margin: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0
			] // [textwidth, textheight, total, left, lmargin, inner, right, rmargin, outer, top, tmarginbottom, bmargin, headheight, headsep, footnotesep, footskip, marginparwidth, marginpar] mm
		}
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
				code = code.replaceAll(x[0], ' ' + x[1] + ' ');
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
				if (bracketed && brackets == '' && !code[i].match(command_bracket))
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
