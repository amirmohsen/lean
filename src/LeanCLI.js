var
	FS = require("fs"),
	Path = require("path"),
	CommandLineArgs = require("command-line-args"),
	LeanCompiler = require("./LeanCompiler.js");

var cli = CommandLineArgs([
    { name: "src", alias: "s", type: String },
    { name: "dest", alias: "d", type: String },
    { name: "help", alias: "h"}
]);

var usage = cli.getUsage({
    title: "lean",
    description: "Precompile lean files",
    footer: "Project home: [underline]{https://github.com/InteractiveRed/lean}"
});

try {
	var options = cli.parse();

	if(options.help) {
		return console.log(usage);
	}

	if(options.src && options.dest) {
		LeanCompiler.compile(false, options.src, options.dest);
	}
	else if(options.src || options.dest) {
		throw new Error("");
	}
	else {
		var
			leanConfig = JSON.parse(FS.readFileSync(process.cwd() + "/lean.json", {
				encoding: "utf8"
			})),
			src = Path.join(process.cwd(), leanConfig.src),
			dest = Path.join(process.cwd(), leanConfig.dest);

		LeanCompiler.run(src, dest);
	}
}
catch(e) {
	console.error(e);
	console.log(usage);
}