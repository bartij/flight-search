const columns = [
    { field: 'flightNum', title: 'Flight' },
    { field: 'airline', title: 'Airline' },
    { field: 'start', title: 'Start' },
    { field: 'landing', title: 'Landing' },
    { field: 'price', title: 'Price' },
    { field: 'duration', title: 'Duration' }
];

const onSubmit = (event) => {
    const fromId = '#from';
    const toId = '#to';
    const dateId = '#date';
    let { from, to, date } = getFormValues(fromId, toId, dateId);
    from = getAirportCode(from);
    to = getAirportCode(to);
    $('.flights-title').text(from + ' - ' + to);

    const now = new Date();
    now.setHours(0,0,0,0);
    const selectedDate = new Date(date);
    if (selectedDate >= now) {
        $('#past-date').hide();
        $('#errorMessage').hide();
        $('#results').hide();
        $('.no-flights').hide();
        $('.loader').show();
        $('button').prop('disabled', true);
        selectedFrom = false;
        selectedTo = false;

        $.ajax({
            type: 'POST',
            data: JSON.stringify({ from, to, date }),
            contentType: 'application/json',
            url: '/search'
        })
            .done(onSuccess)
            .fail(onError);
    } else {
        $('#past-date').show();
    }
    event.preventDefault();
};

const getFormValues = (fromId, toId, dateId) => {
    const from = $(fromId).val();
    const to = $(toId).val();
    let date = $(dateId).val();
    return { from, to, date };
};

const getAirportCode = (airportLabel) => airportLabel.match(/\(([^)]+)\)/)[1];

const setDatesOnTabs = dates =>
    dates.forEach((date, index) => $('#tab'+(index+1)).text(dates[index]));

const onError = (xhr) => {
    $('#errorMessage h2').text(xhr.responseText);
    $('#errorMessage').show();
    $('.loader').hide();
};


const onSuccess = (data) => {
    if (data.flights.length > 0) {
        setDatesOnTabs(data.dates);
        createFlightsTables(data.flights);
        $('.loader').hide();
        $('#results').show();
    } else {
        $('.no-flights').show();
    }
};

const createFlightsTables = flights =>
    flights.forEach((flight, index) => prepareTables(flights[index], '#table'+(index+1)));

const prepareTables = (flightsArray, tableId) => {
    const noFlightsMessageId = '#no-flights-tab'+tableId[tableId.length-1];
    if (flightsArray.length > 0) {
        $(noFlightsMessageId).hide();
        $(tableId).show();
        const flights = prepareFlightsData(flightsArray);
        $(tableId).bootstrapTable({ columns, data: {} });
        $(tableId).bootstrapTable('load', flights);
    } else {
        $(tableId).hide();
        $(noFlightsMessageId).show();
    }
};

const prepareFlightsData = flightsArray =>
    flightsArray.map(flight => ({
        flightNum: flight.flightNum,
        airline: flight.airline,
        start: flight.start.time + ' ' + flight.start.airport,
        landing: flight.finish.time + ' ' + flight.finish.airport,
        price: '$' + flight.price,
        duration: flight.duration
    }));

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
