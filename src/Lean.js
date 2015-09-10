export class Lean {

	constructor() {
		this.name = this.constructor.name;
		this.id = `${this.name}-${Lean.INCREMENTAL_ID++}`;
		this.children = {};
		this.props = {};
		this.element = null;
		this.view = this.name;
		Lean.registerInstance(this);
	}

	render() {
		return Lean.Templates[this.view](this);
	}

	postrender() {
		this.element = document.getElementById(this.id);
		this.element.dataset.self = this;
		this.postrenderRecursive(this.children);
	}

	postrenderRecursive(component) {
		if(!component) {
			return;
		}
		else if(typeof component.postrender === "function") {
			component.postrender();
		}
		else if(Array.isArray(component)) {
			component.forEach(this.postrenderRecursive.bind(this));
		}
		else if(typeof component === "object" && component !== null) {
			for(let childName in component) {
				this.postrenderRecursive(component[childName]);
			}
		}
	}

	rerender(selector) {
		if(selector) {
			var wrapperElement = document.createElement("div");
			wrapperElement.innerHTML = this.render();
			this.element.querySelector(selector).outerHTML = wrapperElement.querySelector(selector).outerHTML;
		}
		else {
			this.element.outerHTML = this.render();
			this.postrender();
		}
	}

	static precompileAllInPage() {
		var allTemplates = document.querySelectorAll('script[type="text/x-handlebars-template"]');

		for (let i = 0; i < allTemplates.length; i++) {
			let template = allTemplates[i], isPartial = false;
			if(template.classList.contains("partial")) {
				isPartial = true;
			}
			Lean.precompile(template.id, template.innerHTML, isPartial);
		}
	}

	static precompileAllFiles(baseDir, extension, templates, partials, done) {
		var promises = [];
		for (let i = 0; i < templates.length; i++) {
			let
				template = templates[i],
				templateName = Lean.getBaseName(template),
				isPartial = partials.indexOf(templateName) > -1 ? true : false;

			promises.push(Lean.precompileFile(baseDir + template + extension, templateName, isPartial));
		}
		$.when.apply($, promises).done(done);
	}

	static precompileFile(templatePath, templateName, isPartial) {
		return $.get(templatePath).done((data) => {
			Lean.precompile(templateName, data, isPartial);
		});
	}

	static precompile(id, innerHTML, isPartial) {
		Lean.Templates[id] = Handlebars.compile(innerHTML);
		if(isPartial) {
			Handlebars.registerPartial(id, Lean.Templates[id]);
		}
	}

	static registerInstance(instance) {
		Lean.AllInstances[instance.id] = instance;
	}

	static findInstance(id) {
		return document.getElementById(id).dataset.self;
	}

	static getBaseName(str) {
		var base = new String(str).substring(str.lastIndexOf('/') + 1);
		if(base.lastIndexOf(".") != -1) {
			base = base.substring(0, base.lastIndexOf("."));
		}
		return base;
	}
}

Lean.INCREMENTAL_ID = 0;

Lean.Templates = {};

Handlebars.registerHelper("render", (template) => {
	if(template && typeof template.render === "function") {
		return template.render();
	}
	else {
		return ""
	}
});

Handlebars.registerHelper("call", (context, func, ...params) => {
	return func.apply(context, params);
});