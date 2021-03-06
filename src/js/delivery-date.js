/* Brazilian initialisation for the jQuery UI date picker plugin. */
/* Written by Leonildo Costa Silva (leocsilva@gmail.com). */
( function( factory ) {
if ( typeof define === "function" && define.amd ) {
    // AMD. Register as an anonymous module.
    define( [ "../widgets/datepicker" ], factory );
} else {
    // Browser globals
    factory( jQuery.datepicker );
}
}( function( datepicker ) {

    datepicker.regional[ delivery_data.locale ] = {
        closeText: delivery_data.closeText,
        prevText: delivery_data.prevText,
        nextText: delivery_data.nextText,
        currentText: delivery_data.currentText,
        monthNames: delivery_data.monthNames,
        monthNamesShort: delivery_data.monthNamesShort,
        dayNames: delivery_data.dayNames,
        dayNamesShort: delivery_data.dayNamesShort,
        dayNamesMin: delivery_data.dayNamesMin,
        weekHeader: delivery_data.weekHeader,
        dateFormat: delivery_data.dateFormat,
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };

    datepicker.setDefaults( datepicker.regional[ delivery_data.locale ] );

    return datepicker.regional[ delivery_data.locale ];
} ) );


jQuery(document).ready(function($) {
    // Days to be disabled as an array
    var disableddates = delivery_data.excludedDates || null; // yyyy-mm-dd
    var disableddates_m_d_Y = delivery_data.excludedDates_m_d_Y || null; //m-d-yyyy

    var time_input = $('#delivery-time');
    var time_input1 = time_input[0][1];
    var time_input2 = time_input[0][2];
    var time_input3 = time_input[0][3];
    var time_input4 = time_input[0][4];
    
    $( '#datepicker' ).change(function(){
        var today = new Date(Date.now());
        var date = jQuery("#datepicker").datepicker("getDate");
        switch(date.getDay()) {
            case 5:
                time_input1.disabled = true;
                time_input2.disabled = true;
                time_input3.disabled = false;
                time_input4.disabled = false;
                break;
            case 6:
                time_input1.disabled = false;
                time_input2.disabled = false;
                time_input3.disabled = false;
                time_input4.disabled = false;
                break;
            case 0:
                time_input1.disabled = false;
                time_input2.disabled = false;
                time_input3.disabled = true;
                time_input4.disabled = true;
                break;
        }
        if(date.getDay() == today.getDay() && date.getMonth() == today.getMonth()){
            if(today.getHours() >= 22){
                time_input1.disabled = true;
                time_input2.disabled = true;
                time_input3.disabled = true;
                time_input4.disabled = true;
            } else if(today.getHours() >= 21){
                time_input1.disabled = true;
                time_input2.disabled = true;
                time_input3.disabled = true;
            } else if(today.getHours() > 14 || (today.getHours() == 14 && today.getMinutes > 30)){
                time_input1.disabled = true;
                time_input2.disabled = true;
            } else if(today.getHours() >= 14){
                time_input1.disabled = true;
            }
        }
    });

    /**
     * This function remove past dates from a given array.
     * @param {Array}  An array of dates.
     * @return {Array} An array of dates without past dates.
     */
    function removePastDates( dates ) {
        var today = Date.now();

        for( var i = dates.length - 1; i >= 0; i-- ) {
            var temp_date = Date.parse( dates[i] );

            if ( temp_date < today ) {
                dates.splice(i, 1);
            }
        }

        return dates;
    }

	/**
	 * Return the maximum day of shipping available.
	 * @return {int} Maximum shipping day from today.
	 */
    function maximumShippingDay(){
        var max = parseInt( delivery_data.daysOffset ) + parseInt( delivery_data.daysSpan );
        max += removePastDates( disableddates ).length;
        return max;
    }

	/**
	 * Check if a given date is enabled or not to delivery.
	 * The function will look if:
	 * - Date is not set in the disableddates array (Set in plugin options panel);
	 * - Date is an available weekday (Set in plugin options panel);
	 * @param  {Date} date A date to be checked.
	 * @return {boolean}     True if date is availbel, false if not.
	 */
    function isDateAvailable(date) {
        var m = date.getMonth();
        var d = date.getDate();
        var y = date.getFullYear();

        // First convert the date in to the m-d-yyyy format
        // Take note that we will increment the month count by 1
        var currentdate = (m + 1) + '-' + d + '-' + y;

		if ( isCustomDisabledDate(currentdate) ) return [false];
		if ( isAvailableWeekDay(date) ) return [true];

        return [false];
    }

	/**
	 * Check if given date is on disableddates array.
	 * @param  {String}  date A date string in m-d-yyyy format
	 * @return {Boolean}      True if disabled, false if not.
	 */
	function isCustomDisabledDate(date) {
		// Check if the date belongs to disableddates array
        if ( null !== disableddates_m_d_Y ) {
            for ( var i = 0; i < disableddates_m_d_Y.length; i++ ) {
                // Now check if the current date is in disableddates array.
                if ( $.inArray(currentdate, disableddates_m_d_Y) != -1 ) {
                    return true;
                }
            }
        }

		return false;
	}

	/**
	 * Check if the day is in one of the available week days.
	 * @param  {Date}  date A date object.
	 * @return {Boolean}    True if available, false if not.
	 */
	function isAvailableWeekDay(date) {
        var weekdays = delivery_data.availableWeekdays;
        var day = date.getDay();
        var available = false;

        for ( var i = 0; i < weekdays.length; i++ ) {
            if ( day === parseInt( weekdays[i] ) ) {
                return true;
            }
        }
	}

	/**
	 * Datepicker beforeShow cllback. Ensure that month without available
	 * days are shown in datepicker. Reference: https://stackoverflow.com/a/47594956
	 */
	function beforeShowDatepicker(text, date) {
		var today = new Date();
		var count = 0;

		while (true) {
			if (isDateAvailable(today)[0] === true) {
				break;
			}

			count++;
			// next date in loop iteration
			today.setDate(today.getDate() + 1);
		}

		// set defaultDate, count is no of days from today,
		// so count 2 will be 2 days from now
		return {
			defaultDate: count
		};
	}

	/**
	 * Starts the Datepicker
	 */
    function openDatePicker() {
        $( '#datepicker' ).datepicker({
            dateFormat: delivery_data.dateFormat,
            maxDate: '+' + maximumShippingDay() + 'D',
            minDate: '+' + parseInt( delivery_data.daysOffset ) + 'D',
			beforeShowDay: beforeShowDatepicker,
            beforeShowDay: isDateAvailable,
            regional: delivery_data.locale,
        }).datepicker( "show" );
    }

	// Event handlers
    $( '#datepicker' ).click( openDatePicker );
    $( '#datepicker' ).bind( 'touchstart', openDatePicker );
    $( '#datepicker' ).keypress(function openDatePicker() {
        return false
    });
});
