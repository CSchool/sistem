function processAjaxData(response, urlPath){
    document.getElementById("content").innerHTML = response;
    window.history.pushState({"html":response.html,"pageTitle":document.title},"", urlPath);
    initializeFastPageTransitions(); // There may be links in loaded page
}

function initializeFastPageTransitions() {
    if (!window.history.pushState)
        return;
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; ++i) {
        var el = links[i];
        if (el.href) 
            if (el.href.substr(location.origin.length) != "/logout") {
                links[i].onclick = new Function('\n\
                var xmlHttp = new XMLHttpRequest();\n\
                xmlHttp.onreadystatechange = function() { \n\
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)\n\
                        processAjaxData(xmlHttp.responseText, \'' + el.href.substr(location.origin.length) + '\');\n\
                }\n\
                xmlHttp.open(\'GET\', \'/raw\' + \'' + el.href.substr(location.origin.length) + '\', true);\n\
                xmlHttp.send(null);\n\
                return false;');
            }
    }
}

window.onload = function() {
    // Fast page transitions.
    initializeFastPageTransitions();
}