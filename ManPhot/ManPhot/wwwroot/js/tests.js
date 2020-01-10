

module('ManPhot Test Suite', {
    setup: function () {
        manPhotNamespace.initialize();
    }
});

test("Linear regression test", function () {
    expect(3);

    var known_x = [5.020, 4.974, 6.016, 6.206, 6.483, 6.626];
    var known_y = [-13.241, -13.279, -12.150, -12.046, -11.710, -11.650];

    var lr = manPhotNamespace.linearRegression(known_y, known_x);
    var slopeExpected = 1.014;
    var interceptExpected = -18.318;
    var r2Expected = 0.99667;

    equal(lr.slope, slopeExpected, 'Expected slope: ' + slopeExpected + ' Actual slope: ' + lr.slope);
    equal(lr.intercept, interceptExpected, 'Expected intercept: ' + interceptExpected + 'Actual intercept: ' + lr.intercept);
    equal(lr.r2, r2Expected, 'Expected R2: ' + r2Expected + 'Actual R2: ' + lr.r2);
});

test("Check Vmag and Error test", function () {
    expect(5);

    $('#obsDate').val('2017:01:05');
    $('#obsHour').val('21');
    $('#obsMin').val('21');
    manPhotNamespace.loadVariable('test_vv_cep');

    alert("Running Test ...");

    $('#comp_imag_1').val('-13.362');
    $('#comp_imag_2').val('-12.764');
    $('#comp_imag_3').val('-12.687');
    $('#comp_imag_4').val('-11.376');

    $('#check_imag').val('-12.772');
    $('#target_imag').val('-12.912');

    $('#btnRefresh').triggerHandler('click');

    var expectedTargetVmag = "5.149";
    var expectedTargetError = "0.03";

    var targetVmag = $('#target_vmag').html();
    var targetError = $('#target_err').html();

    equal(targetVmag, expectedTargetVmag, 'Expected targetVmag: ' + expectedTargetVmag + ' Actual targetVmag: ' + targetVmag);
    equal(targetError, expectedTargetError, 'Expected targetError: ' + expectedTargetError + ' Actual targetError: ' + targetError);

    var expectedCheckVmag = "5.292";
    var expectedCheckError = "0.002";

    var checkVmag = $('#check_vmag').html();
    var checkError = $('#check_err').html();

    equal(checkVmag, expectedCheckVmag, 'Expected checkVmag: ' + expectedCheckVmag + ' Actual checkVmag: ' + checkVmag);
    equal(checkError, expectedCheckError, 'Expected checkError: ' + expectedCheckError + ' Actual checkError: ' + checkError);

    var expectedJD = "2457759.39";
    var actualJD = $('#jd').html();

    equal(actualJD, expectedJD, 'Expected JD: ' + expectedJD + ' Actual JD: ' + actualJD);

});