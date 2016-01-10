var fs = require("fs");

function route(handle, pathname, response, request) {
    if (typeof handle[pathname] === 'function') {
        // Call JS handler
        handle[pathname](response, request); 
    }
    else {
        // Not found
        response.writeHead(404, {
                "Content-type": "text/html"
        });
        fs.readFile("frontend/404.html", "utf8", function(err, data) {
            if (err)
                throw err;
            response.write(data);
            response.end();
        })
    }
}

exports.route = route;