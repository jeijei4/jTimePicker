/*
 * jTimePicker 1.0 plugin for jQuery
 * Original by: Dionlee Uy <dionleeuy@gmail.com>
*/

(function($) {

    var AM_PM = ['AM', 'PM'],
        MAX_HOUR = 12,
        MAX_MIN = 59,
        ACCEPTABLE_KEYS = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105 /*Num keys*/ , 40, 39, 38, 37 /*Arrow Keys*/ , 17, 16, 9 /*Ctrl,Shift,Tab*/ ];

    var jTimePicker = function(elem, options) {
        var that = this;
        this.input = $(elem);
        this.activeField = jTimePicker.HOUR;
        this.picker = null;

        this.hour = $('<input class="tp_hr"    type="text" maxlength="2">');
        this.min = $('<input class="tp_min"    type="text" maxlength="2">');
        this.ampm = $('<input class="tp_am_pm" type="text" maxlength="2">');

        if (options.time) {
            var h = parseInt(options.time.substr(0, 2)),
                m = parseInt(options.time.substr(3, 2));

            //Set values of hour, minute and AM/PM inputs
            this.ampm.val((parseInt(h) > 12 ? "PM" : "AM"));
            this.min.val(m > 10 ? m : "0" + m);
            h = (h > 12 ? h - 12 : h);
            this.hour.val(h > 10 ? h : "0" + h);

            //Set value of anchor input
            this.setValue();
        }

        //Attach event listeners to inputs
        this.hour.on('focus', function() {
            $(this).select();
            that.activeField = jTimePicker.HOUR;
        }).on('blur', function(e) {
            var val = parseInt($(this).val());
            if (val > MAX_HOUR) $(this).val(MAX_HOUR);
            if (val < 10 && val > 0) $(this).val("0" + val);
            that.setValue();
        }).on('keydown', function(e) {
            if (ACCEPTABLE_KEYS.indexOf(e.keyCode) < 0) return false;
        }).on('keyup', function(e) {
            if (e.keyCode == 40) { //Arrow Down/Up button
                that.spinDown();
            } else if (e.keyCode == 38) {
                that.spinUp();
            }
        });
        this.min.on('focus', function() {
            $(this).select();
            that.activeField = jTimePicker.MIN;
        }).on('blur', function(e) {
            var val = parseInt($(this).val());
            if (val > MAX_MIN) $(this).val(MAX_MIN);
            if (val < 10 && val > 0) $(this).val("0" + val);
            that.setValue();
        }).on('keydown', function(e) {
            if (ACCEPTABLE_KEYS.indexOf(e.keyCode) < 0) return false;
        }).on('keyup', function(e) {
            if (e.keyCode == 40) { //Arrow Down/Up button
                that.spinDown();
            } else if (e.keyCode == 38) {
                that.spinUp();
            }
        });
        this.ampm.on('keydown', function(e) {
            if (e.keyCode == 80) { //P button
                $(this).val("PM").select();
                that.setValue();
            } else if (e.keyCode == 65) { //A button
                $(this).val("AM").select();
                that.setValue();
            } else if (e.keyCode == 40 || e.keyCode == 38) { //Arrow Down/Up button
                that.activeField = jTimePicker.AMPM;
                that.adjustTime(null);
            } else if (e.keyCode == 16 || e.keyCode == 9) { return true; }
            return false;
        }).on('focus', function() {
            $(this).select();
            that.activeField = jTimePicker.AMPM;
        });

        this.spinnerDiv = $('<div class="tp_spinners"></div>');
        this.spinUpBtn = $('<span class="tp_spinup"></span>');
        this.spinDownBtn = $('<span class="tp_spindown"></span>');

        //Attache event listeners to spinners
        this.spinUpBtn.on('click', function(e) { that.spinUp(); });
        this.spinDownBtn.on('click', function(e) { that.spinDown(); });

        this.create();
    }

    jTimePicker.prototype = {

        constructor: jTimePicker,

        create: function() {
            var that = this;

            try {
                var def = that.input.val().split(':');
                if ('undefined' != typeof def) {
                    var laHora24 = parseInt(def[0], 10) || 0;
                    var laHora12 = (laHora24 > 12 ? (laHora24 - 12) : laHora24);

                    that.hour.val((laHora12 < 10 ? (0 === laHora12 ? "12" : "0" + laHora12) : "" + laHora12));
                    that.ampm.val((laHora24 > 12 ? "PM" : "AM"));

                    var losMinutos = parseInt(def[1], 10) || 0;
                    that.min.val((losMinutos < 10 ? "0" + losMinutos : "" + losMinutos));
                }

            } catch (e) {
                console.error(e.message);
                that.hour.val("12");
                that.min.val("00");
                that.ampm.val("AM");
            }

            that.input.wrap('<div class="tp"></div>');
            that.input.hide();

            that.picker = that.input.parent();

            that.picker.append(that.hour).append("<span style=\"tp_colon\">&#58;</span>").append(that.min).append("&nbsp;").append(that.ampm).append("&nbsp;");

            that.spinnerDiv.append(that.spinUpBtn).append(that.spinDownBtn).appendTo(that.picker);


        },

        spinUp: function() { this.adjustTime('p'); },

        spinDown: function() { this.adjustTime('m'); },

        adjustTime: function(op) {
            var that = this;
            switch (this.activeField) {
                case jTimePicker.HOUR:
                    var val = parseInt(that.hour.val()),
                        limit = (op == 'p' ? MAX_HOUR : 1);
                    val = (op == 'p' ? val + 1 : val - 1);

                    if ((op == 'p' ? (val <= limit) : (val >= limit))) { that.hour.val((val < 10 ? "0" + val : val)).select(); }
                    break;
                case jTimePicker.MIN:
                    var val = parseInt(that.min.val()),
                        limit = (op == 'p' ? MAX_MIN : 0);
                    val = (op == 'p' ? val + 1 : val - 1);

                    if ((op == 'p' ? (val <= limit) : (val >= limit))) { that.min.val((val < 10 ? "0" + val : val)).select(); }
                    break;
                case jTimePicker.AMPM:
                    var val = that.ampm.val();
                    that.ampm.val((val == 'AM' ? "PM" : "AM")).select();
                    break;
            }
            this.setValue();
        },

        setValue: function() {
            var ap = this.ampm.val(),
                h = this.hour.val(),
                m = this.min.val();
            if (ap == "PM") h = parseInt(h) + 12;
            var val = h + ":" + m + ":00";
            this.input.attr('value', val);
        }
    }

    jTimePicker.HOUR = 1;
    jTimePicker.MIN = 2;
    jTimePicker.AMPM = 3;

    /* DEFINITION FOR TIME PICKER */
    $.fn.jtimepicker = function(opts) {
        return $(this).each(function() {
            var $this = $(this),
                data = $(this).data('jtimepickerdata'),
                options = $.extend({}, {}, $this.data(), typeof opts == 'object' && opts);
            if (!data) {
                $this.data('jtimepickerdata', (data = new jTimePicker(this, options)));
            }
            if (typeof opts == 'string') data[opts]();
        });
    }
    $.fn.jtimepicker.Constructor = jTimePicker;

})(jQuery);