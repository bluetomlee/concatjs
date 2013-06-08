console.time('Finished task in: ');

var fs = require('fs');

function readFile(path) {
	return fs.readFileSync(path, 'utf-8');
}

function logHeader() {
	console.log('\n------------ concat.js ------------\n');
}

function logFooter() {
	console.log('\n-----------------------------------\n');
}

function logError(message) {
	logHeader();
	console.log('ERROR: ' + message);
	logFooter();
}

function minifyCss(css) {
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
	return 'style>' + minifyCss(fileContent) + '</style>' + part[1];
}

function parseScriptTag(tag) {
	var part = tag.split('>');
	var fileContent = readFile(getUrl(part[0], 'src='));
	return 'script>' + fileContent;
}

function runConcat(fileToRead, fileToSave) {
	var data = readFile(fileToRead).replace(/<!--[\s\S]*?-->/g, ''); //delete comments in the HTML...
	var tags = data.split('<');
	var i;
	for (i = 0; i < tags.length; i++) {
		if (isScriptTag(tags[i].toLowerCase())) {
			while (isNonMinScriptFile(tags[i].toLowerCase())) {
				tags.splice(i, 2);
			}
			if (isMinScriptFile(tags[i].toLowerCase())) {
				tags[i] = parseScriptTag(tags[i]);
			}
		}
		if (isCssFile(tags[i].toLowerCase())) {
			tags[i] = parseCssTag(tags[i]);
		}
		if (tags[i].toLowerCase().indexOf('script>') !== 0) {
			tags[i] = tags[i].replace(/\n/g, '').replace(/\t/g, '');
		}
	}
	fs.writeFileSync(fileToSave, tags.join('<'));
	logHeader();
	console.log('Done! Result was written to: ' + fileToSave);
	console.timeEnd('Finished task in: ');
	logFooter(); //END OF PROGRAM
}

(function getInput() {
	var args = process.argv;
	args.splice(0, 2); //remove node and concat.js args
	if (args.length === 0) {
		logError('You didnt enter any files to read or write to!');
	} else if (args.length > 2) {
		logError('Too many arguments!');
	} else if (args[0].search('.html') === -1) {
		logError('"' + args[0] + '" is not a .html file!');
	} else {
		if (args.length === 1) {
			args.push(args[0].replace('.html', '.concat.html'));
		}
		if (args[1].search('.html') === -1) {
			args[1] += '.concat.html';
		}
		if (args[0] === args[1]) {
			logError('File names must differ in order to avoid overwriting!');
			return;
		}
		runConcat(args[0], args[1]);
	}
}());