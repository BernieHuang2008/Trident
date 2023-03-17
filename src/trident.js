// generate a class called Trident
class Trident {
	constructor(div, config) {
		this.div = div;
		this.config = config;
	}

	_normalizeCode(code) {
		code = code.replaceAll(/\%.+?\n/g, "\n");
		code = code.replaceAll("\n\n", "\\TRIDENTCOMMAND_NEWLINE ");
		code = code.replaceAll("\\\\", "\\TRIDENTCOMMAND_NEWLINE ");
		code = code.replaceAll(/\\\s/g, "\\TRIDENTCOMMAND_BACKSLASH ");
		code = code.replaceAll(/\s+/g, " ");
		return code;
	}

	reparse(code) {
		console.log(code)
		code = this._normalizeCode(code);
		console.log(code.split(" "));
	}

	static a4 = {
		// the unit is mm
		paper_width: 210,
		paper_height: 297,

		// the unit is pt
		font_size: 12,
		font_family: 'Times New Roman',
		line_height: 1.5
	};
}
