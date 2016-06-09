$(document).ready(function () {
    $('#compare').mergely({
        cmsettings: { readOnly: false },
        width: 'auto',
        lhs: function (setValue) {
            setValue("Hello World");
        },
        rhs: function (setValue) {
            setValue("Hi World");
        }
    });
});