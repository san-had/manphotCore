/// <reference path="jquery-3.1.1.js" />

(function () {
    this.starInstanceNameSpace = this.starInstanceNameSpace || {};
    var ns = this.starInstanceNameSpace;

    ns.fetchJSONFile = function (path, callback) {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                    var data = JSON.parse(httpRequest.responseText);
                    if (callback) {
                        callback(data);
                    }
                }
                else {
                    alert("HTTP error: " + httpRequest.status + " " + httpRequest.statusText);
                }
            } 
        }
        httpRequest.open('GET', path);
        httpRequest.send();
    }

})();

