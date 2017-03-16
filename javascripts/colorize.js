window.addEventListener("load", function () {
    "use strict";

    var codes = document.getElementsByClassName("code");

    window.colorize = function (text, trim) {
        var regexComment = /(\/{2}.*)\n/g;
        var regexHTMLAttribute = /(\w+?)\=/g;
        var regexHTMLTag = /(&lt;\/?)(button|code|div|input|label|p|select|span|textarea|ul)/g;
        var regexString = /([\[\(\s\=>])("[^"]*?")([<;:,\s\)\]&])/g;
        var regexVar = /(else|false|function|if|new|return|true|var|while)/g;
        var regexWhite = /\ {12}/g;
        var replaceAttribute = "<pre class=\"number\">$1</pre>=";
        var replaceBlue = "<pre class=\"blue\">$1</pre>";
        var replaceComment = "<pre class=\"comment\">$1</pre>\n";
        var replacePink = "$1<pre class=\"pink\">$2</pre>$3";
        var replaceTag = "$1<pre class=\"blue\">$2</pre>";
        var replaceWhite = "";
        if (trim) {
            function removeFirstLastLines(str) {
                var index = str.indexOf("\n");
                var lastIndex = str.lastIndexOf("\n");
                str = str.substring(index + 1, lastIndex);
                return str;
            }
            text = removeFirstLastLines(text);
        }
        text = text.replace(regexHTMLAttribute, replaceAttribute);
        text = text.replace(regexHTMLTag, replaceTag);
        text = text.replace(regexString, replacePink);
        text = text.replace(regexVar, replaceBlue);
        text = text.replace(regexWhite, replaceWhite);
        text = text.replace(regexComment, replaceComment);
        return text;
    };

    Object.keys(codes).forEach(function (key) {
        var code = codes[key];
        var text = code.innerHTML;
        code.innerHTML = window.colorize(text);
    });
});
