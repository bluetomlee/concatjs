console.time('Finished task in: ');

var fs = require('fs');

function readFile(path) {
	return fs.readFileSync(path, 'utf-8');
}

function logHeader() {
	console.log('------------ Concat.js ------------');
	console.log(' ');
}

function logFooter() {
	console.log(' ');
	console.log('-----------------------------------');
}

function logError(message) {
	logHeader();
	console.log('ERROR: ' + message);
	logFooter();
}

function cssMinify(css) {
	css = css.replace(/\n/ig, '');
	css = css.replace(/\s*:\s*/ig, ':');
	css = css.replace(/\s*\,\s*/ig, ',');
	css = css.replace(/\s*\{\s*/ig, '{');
	css = css.replace(/\s*\}\s*/ig, '}');
	css = css.replace(/\s*\;\s*/ig, ';');
	return css;
}

function isCssFile(tag) {
	return tag.indexOf('link') === 0 && tag.search('stylesheet') !== -1 && tag.search('.css') !== -1 && tag.search('http://') === -1 && tag.search('href=') !== -1;
}

function isScriptTag(tag) {
	return tag.indexOf('script') === 0;
}

function isNonMinScriptFile(tag) {
	return tag.search('src') !== -1 && tag.search('http://') === -1 && tag.search('.min.js') === -1;
}

function isMinScriptFile(tag) {
	return tag.search('src') !== -1 && tag.search('http://') === -1 && tag.search('.min.js') !== -1;
}

function getUrl(tag, srcOrHref) {
	var start = tag.indexOf(srcOrHref) + srcOrHref.length;
	var semicolonType = tag[start];
	var end = tag.indexOf(semicolonType, start + 1);
	return tag.substring(start + 1, end);
}

function parseCssTag(tag) {
	var part = tag.split('>');
	var fileContent = readFile(getUrl(part[0], 'href='));
	return 'style>' + cssMinify(fileContent) + '</style>' + part[1];
}

function parseScriptTag(tag) {
	var part = tag.split('>');
	var fileContent = readFile(getUrl(part[0], 'src='));
	return 'script>' + fileContent;
}

function runConcat(fileToRead, fileToSave) {
	var data = readFile(fileToRead).replace(/<!--[\s\S]*?-->/g, ''); //delete comments in the HTML...
	var tags = data.split('<');
	var tag, i;
	for (i = 0; i < tags.length; i++) {
		tag = tags[i].toLowerCase(); //to LC for comparison only!
		if (isScriptTag(tag)) {
			while (isNonMinScriptFile(tags[i].toLowerCase())) {
				tags.splice(i, 2);
			}
			if (isMinScriptFile(tags[i].toLowerCase())) {
				tags[i] = parseScriptTag(tags[i]);
			}
		}
		if (isCssFile(tag)) {
			tags[i] = parseCssTag(tags[i]);
		}
		if (tag.indexOf('script>') !== 0) {
			tags[i] = tags[i].replace(/\n/g, '').replace(/\t/g, '');
		}
	}

	fs.writeFileSync(fileToSave, tags.join('<'));
	logHeader();
	console.timeEnd('Finished task in: ');
	logFooter();
}

function validateInput() {
	var input = process.argv;
	input.splice(0, 2);
	if (input.length === 0) {
		logError('You didnt enter any files to read or write to!');
	} else if (input.length > 2) {
		logError('Too many arguments!');
	} else if (input[0].search('.html') === -1) {
		logError('"' + input[0] + '" is not a .html file!');
	} else {

		if (input.length === 1) {
			input.push(input[0].replace('.html', '.concat.html'));
		} else {
			if (input[1].search('.html') === -1) {
				input[1] += '.concat.html';
			}
		}

		if (input[0] === input[1]) {
			logError('File names must differ in order to avoid overwriting!');
			return;
		}

		runConcat(input[0], input[1]);

	}
}

validateInput();