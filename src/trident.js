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
			[/\%.+?\n/g, '\n'],
			['\n\n', '\\TRIDENTCOMMAND_NEWLINE'],
			['\\\\', '\\newline'],
			[/\$\$(.+?)\$\$/g, " \begin{equation} $1 \end{equation} "],
			[/\s+/g, ' '],
			[/\\ /g, '\\TRIDENTCOMMAND_SPACE'],
			['\\#', '\\TRIDENTCOMMAND_HASHTAG'],
			['\\$', '\\TRIDENTCOMMAND_DOLLAR'],
			['\\%', '\\TRIDENTCOMMAND_PERCENT'],
			['\\^', '\\TRIDENTCOMMAND_CARET'],
			['\\&', '\\TRIDENTCOMMAND_AND'],
			['\\_', '\\TRIDENTCOMMAND_UNDERLINE'],
			['\\{', '\\TRIDENTCOMMAND_LEFTBRACE'],
			['\\}', '\\TRIDENTCOMMAND_RIGHTBRACE'],
			['\\[', '\\TRIDENTCOMMAND_LEFTBRACKET'],
			['\\]', '\\TRIDENTCOMMAND_RIGHTBRACKET'],
			['\\(', '\\TRIDENTCOMMAND_LEFTPARENT'],
			['\\)', '\\TRIDENTCOMMAND_RIGHTPARENT'],
			['\\~', '\\TRIDENTCOMMAND_TILDE'],
			[/\s+/g, ' ']
		].forEach(x => {
			code = code.replaceAll(x[0], x[1] + ' ');
		})
		code = code.replaceAll(/\\#/g, "\\TRIDENTCOMMAND_SPACE ");
		return code;
	}

	_parseCode(code) {
		var i = 0;
		const command_char = /[a-z]|[A_Z]|_|{|}|\[|\]/g;
		const command_bracket=/\[|\(|{/g;

		function parseCommand() {
			var command = '\\';
			i++;
			var brackets='';
			while (code[i].match(command_char)) {
				command += code[i];
				if(code[i].match(command_bracket)){
					
				}
				i++;
			}
			return command;
		}

		var ref = [];

		for (i = 0; i < code.length; i++) {
			if (code[i] == "\\") {
				var command = parseCommand();
				ref.push(command);
			}
		}

		for (var j = 0; j < ref.length; j++) {
			code.replaceAll(ref[j], "\TRIDENTCOMMAND_REPLACE" + String(j));
		}

		return [ref, code];
	}

	reparse(code) {
		code = this._parseCode(this._normalizeCode(code));

		console.log(code);
	}
}
