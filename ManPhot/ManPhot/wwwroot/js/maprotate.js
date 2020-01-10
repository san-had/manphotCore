/// <reference path="jquery-3.1.1.js" />

$(document).ready(function () {
    mapRotateNamespace.initialize();
});

(function () {
    this.mapRotateNamespace = this.mapRotateNamespace || {};
    var ns = this.mapRotateNamespace;

    var degree = 0;

    ns.initialize = function () {
        $('#btnPlus').on('click', rotatePlus);
        $('#btnMinus').on('click', rotateMinus);
        $('#imgMap').on('click', rotate);
        $('#txtDegree').val(30);

        var mapName = getQueryVariable("mapName");
        document.title = mapName;
        if (mapName === undefined) {
            mapName = "UU_Aur";
        }

        loadMapImage(mapName);        
    };

    function rotate(event) {
        var imgWidth = $('#imgMap').width();
        var xPos = event.clientX;
        xPos > (imgWidth / 2) ? rotatePlus() : rotateMinus();
    }

    function rotatePlus() {
        degree += Number($('#txtDegree').val());
        $('#imgMap').css('transform', 'rotate(' + degree + 'deg)');
    }

    function rotateMinus() {
        degree -= Number($('#txtDegree').val());
        $('#imgMap').css('transform', 'rotate(' + degree + 'deg');
    }

    function loadMapImage(mapName) {
        var extension = ".png";
        $("#imgMap").attr('src', "maps/" + mapName + extension);
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
    }
})();