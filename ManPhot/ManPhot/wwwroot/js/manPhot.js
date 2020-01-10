/// <reference path="jquery-3.1.1.js" />

$(document).ready(function () {
    manPhotNamespace.initialize();    
});

(function () {
    this.manPhotNamespace = this.manPhotNamespace || {};
    var ns = this.manPhotNamespace;

    var slope = 0;
    var intercept = 0;

    var checkStarLabel = "";
    var targetMap = "";
    var targetComment = "";

    ns.initialize = function () {
        $('#obsDate').datepicker();
        $('#obsDate').change(function () {
            var dateArray = $('#obsDate').val().split('/');
            var formatted = dateArray[2] + ':' + dateArray[0] + ':' + dateArray[1]
            $('#obsDate').val(formatted);
        });
        $('#obsHour').change(function () {
            var hour = $('#obsHour').val();
            if (isNaN(hour) || hour > 23 || hour.toString().length > 2 ) {
                alert("Invalid hour!");
                $('#obsHour').val('');
            }
        });
        $('#obsMin').change(function () {
            var min = $('#obsMin').val();
            if (isNaN(min) || min > 59 || min.toString().length > 2) {
                alert("Invalid minute!");
                $('#obsMin').val('');
            }
        });
        $('#btnRefresh').click(ns.refreshData);
        $('#btnReset').click(function () {
            var proceed = confirm('Are you sure?');
            if (proceed) {
                ns.reset();
            }
        });
        $('#btnDelete').click(function () {
            var proceed = confirm('Are you sure about deleting all of the records?');
            if (proceed) {
                ns.deleteAll();
            }
        });
        $('#btnSave').click(function () {
            if ($('#target_vmag').html().length > 0) {
                ns.saveVariable();
            } else {
                alert("Please do calculation before save!");
            }
        });
        $('#varSelector').change(function () {
            var selectedVal = this.value;
            $('#obsMin').val('');
            ns.loadVariable(selectedVal);
        });
        ns.loadVariable($('#varSelector').val());

        if (!ns.isWebStorageSupported()) {
            alert("Your browser does not support localStorage, you could not save final result!")
        }
        
        ns.bindToGrid();
    }

    ns.isWebStorageSupported = function() {
        return 'localStorage' in window;
    }

    ns.loadVariable = function (selectedVal) {
        var path = "/vars/" + selectedVal + ".txt";
        starInstanceNameSpace.fetchJSONFile(path, ns.loadTarget);
    }

    ns.loadTarget = function (data) {

        targetMap = data.varStar.mapid;
        targetComment = data.varStar.comment;

        var html = '';
        html += '<tr><td id="targetStar">' + data.varStar.name + '</td>';
        html += '<td class="cord">' + data.varStar.ra + '</td>';
        html += '<td class="cord">' + data.varStar.de + '</td>';
        html += '<td><input type="number" id="target_imag"/></td>';
        html += '<td id="target_vmag"  class="vmag"></td>';
        html += '<td id="target_err" class="targetError"></td></tr>';

        $('#target tbody').html(html);

        html = '<tr>';
        for (var i = 0; i < data.varStar.maps.length; i++) {
            var path = "map.html?mapName=";
            var mapName = data.varStar.maps[i];
            path = path + mapName;
            html += '<td><a href="' + path + '" target="_blank">' + mapName + '</a></td>';
        }
        html += '</tr>';
        $('#maps tbody').html(html);

        ns.loadCheck(data.varStar.checkstar);

        ns.loadComparisons(data.varStar.compstars);
    }

    ns.loadCheck = function (data) {

        checkStarLabel = data.label;

        var html = '';
        html += '<tr><td class="star">' + data.label + '</td>';
        html += '<td class="cord">' + data.ra + '</td>';
        html += '<td class="cord">' + data.de + '</td>';
        html += '<td id="check_vcat" class="vcat">' + Number(data.vcat).toFixed(3) + '</td>';
        html += '<td><input type="number" id="check_imag"/></td>';
        html += '<td id="check_vmag"  class="vmag"></td>';
        html += '<td id="check_err" class="error"></td></tr>';

        $('#check tbody').html(html);
    }

    ns.loadComparisons = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var comp_id = 'comp_' + data[i].sn;
            html += '<tr><td class="id">' + data[i].sn + '</td>';
            html += '<td class="star">' + data[i].label + '</td>';
            html += '<td class="cord">' + data[i].ra + '</td>';
            html += '<td class="cord">' + data[i].de + '</td>';
            html += '<td id="' + comp_id + '_vcat" class="vcatComp">' + Number(data[i].vcat).toFixed(3) + '</td>';
            html += '<td><input type="number" id="comp_imag_' + data[i].sn + '"/></td>';
            html += '<td id="' + comp_id + '_vmag" class="fvmag"></td>';
            html += '<td id="' + comp_id + '_err" class="error"></td>';
        }

        $('#comparison tbody').html(html);
    }

    ns.refreshData = function () {
        var proceed = ns.showJulianDate();
        if (proceed) {
            ns.calcLinearRegression();
            ns.calcFitValues();
        }
    }

    ns.calcLinearRegression = function () {
        var arrayImags = new Array();
        var arrayVmags = new Array();
        var failure = false;

        $("input[id^='comp_imag_']").each(function (i, el) {
            if ($(el).val() != '') {
                var comp_id = '#comp_' + $(el).attr('id').substr(10) + "_vcat";
                var imag = $(el).val().replace(',', '.');
                if (isNaN(imag)) {
                    alert("Wrong Imag value: " + imag + " at index: " + i);
                    failure = true;
                } else {
                    arrayImags.push(Number(imag));
                }
                var vcat = $(comp_id).html().replace(',', '.');
                if (isNaN(vcat)) {
                    alert("Wrong VCat value: " + vcat + " at index: " + i);
                    failure = true;
                } else {
                    arrayVmags.push(Number(vcat));
                }
            }
        });

        if (failure) {
            alert("Wrong data entry, no calculation performed!");
            return failure;
        }

        if ( arrayImags.length < 2 ) {
            alert("Few data entry, add more Imag values!");
            return failure;
        }

        if (arrayVmags.length < 2) {
            alert("Few Vcat data, define more Vcat values!");
            return failure;
        }

        var lr = ns.linearRegression(arrayImags, arrayVmags);
        $('#slope').html(lr.slope);
        $('#intercept').html(lr.intercept);
        $('#r2').html(lr.r2);

        return failure;
    }

    ns.calcFitValues = function () {
        var failure;
        var summ_error = 0;
        var num = 0;

        $("input[id^='comp_imag_']").each(function (i, el) {
            failure = false;
            var comp_id = '#comp_' + $(el).attr('id').substr(10) + "_vcat";
            var fit_id = '#comp_' + $(el).attr('id').substr(10) + "_vmag";
            var error_id = '#comp_' + $(el).attr('id').substr(10) + "_err";
            if ($(el).val() != '') {
                var imag = $(el).val().replace(',', '.');
                if (isNaN(imag)) {
                    failure = true;
                } 
                var vcat = $(comp_id).html().replace(',', '.');
                if (isNaN(vcat)) {
                    failure = true;
                }
                if (!failure) {
                    var fitValue = (imag - intercept) / slope;
                    fitValue = Math.round(fitValue * 1000) / 1000;
                    $(fit_id).html(fitValue.toFixed(3));

                    var error = fitValue - vcat;
                    error = Math.round(error * 1000) / 1000;
                    $(error_id).html(error.toFixed(3));
                    summ_error += Math.abs(error);
                    num += 1;
                }
                else {
                    ns.resetSlopeValues();
                }
            }
            else {
                $(fit_id).html('');
                $(error_id).html('');
            }
        });

        if (!failure) {
            var checkVcat = $('#check_vcat').html();
            var checkImag = $('#check_imag').val().replace(',', '.');
            var checkVmag = (checkImag - intercept) / slope;
            checkVmag = Math.round(checkVmag * 1000) / 1000;
            $('#check_vmag').html(checkVmag.toFixed(3));
            var checkError = checkVmag - checkVcat;
            checkError = Math.round(checkError * 1000) / 1000;
            $('#check_err').html(checkError.toFixed(3));

            var targetImag = $('#target_imag').val().replace(',', '.');
            var targetVmag = (targetImag - intercept) / slope;
            targetVmag = Math.round(targetVmag * 1000) / 1000;
            $('#target_vmag').html(targetVmag.toFixed(3));

            var targetError = summ_error / num;
            targetError = Math.round(targetError * 1000) / 1000;
            $('#target_err').html(targetError.toFixed(3));
        }
    }

    ns.showJulianDate = function () {
        var isShown = false;
        var obsDate = $('#obsDate').val();
        var hour = $('#obsHour').val();
        var minute = $('#obsMin').val();

        if (obsDate.length > 0 && hour.length > 0 && minute.length > 0) {
            var dateArray = obsDate.split(':');
            var year = dateArray[0];
            var month = dateArray[1] - 1;
            var day = dateArray[2];

            var date = new Date(year, month, day, hour, minute, 0, 0);
            if (date < Date.now()) {
                $('#jd').html(date.getJulian());
                isShown = true;
            }
            else {
                alert("Observation date is higher than current date!");
                isShown = false;
            }
        }
        else {
            alert("Please add the observation date and time!");
        }

        return isShown;
    }

    ns.dataEntry = function () {
        $('#comp_imag_1').val('-13.362');
        $('#comp_imag_2').val('-12.764');
        $('#comp_imag_3').val('-12.687');
        $('#comp_imag_4').val('-11.376');

        $('#check_imag').val('-12.772');
        $('#target_imag').val('-12.912');

    }

    ns.resetSlopeValues = function () {
        $('#slope').html('');
        $('#intercept').html('');
        $('#r2').html('');
    }

    ns.reset = function () {
        ns.resetSlopeValues();

        $("input[id^='comp_imag_']").each(function (i, el) {
            $(el).val('');
        });
        $('.fvmag').each(function (i, el) {
            $(el).html('');
        });
        $('.error').each(function (i, el) {
            $(el).html('');
        });

        $('#check_imag').val('');
        $('#check_vmag').html('');
        $('#check_err').html('');

        $('#target_imag').val('');
        $('#target_vmag').html('');
        $('#target_err').html('');
        $('#obsMin').val('');
    }

    ns.linearRegression = function (y, x) {         //y: imags, x: vmags

        var lr = {};

        var n = y.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;

        for (var i = 0; i < y.length; i++) {
            sum_x += Number(x[i]);
            sum_y += Number(y[i]);
            sum_xy += (Number(x[i]) * Number(y[i]));
            sum_xx += (Number(x[i]) * Number(x[i]));
            sum_yy += (Number(y[i]) * Number(y[i]));
        }

        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
        lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

        slope = lr.slope;
        intercept = lr.intercept;

        lr['slope'] = Math.round(lr.slope * 1000) / 1000;
        lr['intercept'] = Math.round(lr.intercept * 1000) / 1000;
        lr['r2'] = Math.round(lr.r2 * 100000) / 100000;

        return lr;
    }

    ns.saveVariable = function () {

        var hour = $('#obsHour').val().length == 1 ? "0" + $('#obsHour').val() : $('#obsHour').val();
        var minute = $('#obsMin').val().length == 1 ? "0" + $('#obsMin').val() : $('#obsMin').val();

        var vmag = $('#target_vmag').html();
        var error = $('#target_err').html();
        var checkVmag = $('#check_vmag').html();

        vmag = Math.round(vmag * 100) / 100; 
        error = Math.round(error * 100) / 100;
        checkVmag = Math.round(checkVmag * 100) / 100;

        var key = $('#varSelector').val() + '_' + $('#obsDate').val().replace(/:/g, '');
        var varStar = {};
        varStar.id = key;
        varStar.name = $('#varSelector option:selected').text();
        varStar.jd = $('#jd').html();
        varStar.date = $('#obsDate').val().replace(/:/g,'.');
        varStar.time = hour + ":" + minute;
        varStar.vmag = vmag.toFixed(2);
        varStar.err = error.toFixed(2);
        varStar.tg = "TG";
        varStar.no = "NO";
        varStar.std = "STD";
        varStar.ensemble = "ENSEMBLE";
        varStar.na = "na";
        varStar.checklabel = checkStarLabel;
        varStar.checkvmag = checkVmag.toFixed(2);
        varStar.mapid = targetMap;
        varStar.comment = targetComment;

        var results = ns.retrieveFromStorage();

        results.push(varStar);

        localStorage.setItem('varstars', JSON.stringify(results));

        ns.bindToGrid();
    }

    ns.retrieveFromStorage = function() {
        var varstarsJSON = localStorage.getItem('varstars');
        return varstarsJSON ? JSON.parse(varstarsJSON) : [];
    }

    ns.bindToGrid = function () {
        var results = ns.retrieveFromStorage();
        var html = '';

        for (var i = 0; i < results.length; i++) {
            var star = results[i];
            html += '<tr><td>&nbsp;&nbsp;</td>';
            html += '<td>' + star.name + '</td>';
            html += '<td>' + star.jd + '</td>';
            html += '<td class="text">' + star.date + '</td>';
            html += '<td class="text">' + star.time + '</td>';
            html += '<td class="text">' + star.vmag + '</td>';
            html += '<td class="text">' + star.err + '</td>';
            html += '<td>' + star.tg + '</td>';
            html += '<td>' + star.no + '</td>';
            html += '<td>' + star.std + '</td>';
            html += '<td>' + star.ensemble + '</td>';
            html += '<td>' + star.na + '</td>';
            html += '<td class="text">' + star.checklabel + '</td>';
            html += '<td class="text">' + star.checkvmag + '</td>';
            html += '<td>' + star.mapid + '</td>';
            html += '<td>' + star.comment + '</td>';

            html += '<td><a class="delete" href="javascript:void(0)" data-key=' + i + '>Delete</a></td></tr>';
        }
        html = html || '<tr><td colspan="16">No records available</td></tr>';
        $('#varstars tbody').html(html);
        $('#varstars a.delete').click(ns.deleteVarStar);
    }

    ns.deleteVarStar = function () {        
        var key = parseInt($(this).attr('data-key'));
        
        var results = ns.retrieveFromStorage();
        var confirmText = "Are you sure about deleting of " + results[key].id + "?";
        var isConfirmed = confirm(confirmText);
        if (isConfirmed) {
            results.splice(key, 1);
            localStorage.setItem('varstars', JSON.stringify(results));
            ns.bindToGrid();
        }
    }

    ns.deleteAll = function () {
        localStorage.removeItem('varstars');
        ns.bindToGrid();
    }
})();

Date.prototype.getJulian = function () {
    var jd = (this / 86400000) - (this.getTimezoneOffset() / 1440) + 2440587.5;
    return Math.round( jd * 100 ) / 100;
}
