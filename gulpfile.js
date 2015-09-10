var
	Compiler = require("./src/LeanCompiler.js"),
	src = __dirname + "/src/Lean.js",
	dest = __dirname + "/dist/lean.js";

Compiler.gulp(src, dest);