const columns = [
    { field: 'flightNum', title: 'Flight' },
    { field: 'airline', title: 'Airline' },
    { field: 'start', title: 'Start' },
    { field: 'landing', title: 'Landing' },
    { field: 'price', title: 'Price' },
    { field: 'duration', title: 'Duration' }
];

const onSubmit = (event) => {
    const from = $('#from').val();
    const to = $('#to').val();
    let date = $('#date').val();
    date = date.split('-').join('');
    $('.flights-title').text(from + ' - ' + to);
    if (!moment().isAfter(moment(date).add(-2, 'd'))) {
        $('#past-date').hide();
        $('#errorMessage').hide();
        $('#results').hide();
        $('.no-flights').hide();
        $('.loader').show();
        $.ajax({
            type: 'POST',
            data: JSON.stringify({ from, to, date }),
            contentType: 'application/json',
            url: 'http://localhost:3000/search',
            error: onError,
            success: onSuccess
        });
    } else {
        $('#past-date').show();
    }
    event.preventDefault();
};

const setDatesOnTabs = (dates) => {
    $('#tab1').text(dates[0]);
    $('#tab2').text(dates[1]);
    $('#tab3').text(dates[2]);
    $('#tab4').text(dates[3]);
    $('#tab5').text(dates[4]);
};

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

const createFlightsTables = (flights) => {
    prepareTables(flights[0], '#table1');
    prepareTables(flights[1], '#table2');
    prepareTables(flights[2], '#table3');
    prepareTables(flights[3], '#table4');
    prepareTables(flights[4], '#table5');
};

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

