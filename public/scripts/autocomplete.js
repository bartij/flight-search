const getSource = (request, response, inputId) => {
    $.ajax({
        type: 'GET',
        url: '/airports/'+request.term
    }).done(data => {
        if (data.errorMessage) {
            response([data.errorMessage]);
            $(inputId).autocomplete('option', 'disabled', true);
            setTimeout(() => $(inputId).autocomplete('close'), 1000);
        } else {
            const airports = data.map(airport => airport.airportName + ', ' + airport.cityName + ' (' + airport.airportCode + ')');
            response(airports);
        }
    });
};

const focusFromInputOnStartup = () => {
    $(document).ready(function() {
        $('#from').focus();
    });
};

const setMinDateLimit = () => {
    const minDate = moment().format('YYYY-MM-DD');
    $('#date').prop('min', minDate);
};

const onAutocompleteSelect = (inputId) => {
    $(inputId).on('autocompleteselect', () => {
        $(inputId).autocomplete('option', 'disabled', false);
        inputId === '#from' ? selectedFrom = true : selectedTo = true;
        if (selectedFrom && selectedTo) {
            $('button').prop('disabled', false);
        }
    });
};

const onAutocompleteChange = (inputId) => {
    $(inputId).on('change', () => {
        $(inputId).autocomplete("enable");
    });
};

const enableSubmitButtonOnDateChange = () => {
    $('#date').on('change', () => {
        if (selectedFrom && selectedTo) {
            $('button').prop('disabled', false);
        }
    });
};

const createOptions = (inputId) => ({
    delay: 300,
    minLength: 2,
    autoFocus: true,
    source: (request, response) => getSource(request, response, inputId)

});