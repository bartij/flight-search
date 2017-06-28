const getSource = (request, response) => {
    $.ajax({
        type: 'GET',
        url: '/airports/'+request.term
    }).done(data => {
        const airports = data.map(airport => airport.airportName + ', ' + airport.cityName + ' (' + airport.airportCode +')');
        response(airports);
    }).fail(onError);
};

const focusFromInput = () => {
    $(document).ready(function() {
        $('#from').focus();
    });
};

const setMinDateLimit = () => {
    const minDate = moment().format('YYYY-MM-DD')
    $('#date').prop('min', minDate);
};

const onAutocompleteSelect = (inputId) => {
    $(inputId).on('autocompleteselect', () => {
        inputId === '#from' ? selectedFrom = true : selectedTo = true;
        if (selectedFrom && selectedTo) {
            $('button').prop('disabled', false);
        }
    });
};

const enableSubmitButtonOnDateChange = () => {
    $('#date').on('change', () => {
        $('button').prop('disabled', false);
    });
};