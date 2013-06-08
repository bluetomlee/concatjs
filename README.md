concat.js
========

is a Node.js script that concatenates HTML, CSS and JS into a single .HTML file for faster page load.

It removes whitespace and comments from your CSS and HTML, but NOT from your JS files. This way you can pick your favourite minification tool (Closure compiler anyone?).

Usage
=====

    node concat.js fileToConcat.html concatFileName.html

**Warning!** Concat.js removes all LOCAL script tags that does not end with ".min.js"!!! If you want to include a local, non-minified file, you have to rename it.

Inline scripts + scripts loaded from another URL wont be removed.
