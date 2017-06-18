const moment = require('moment');

const formatDate = (date) =>
    (date !== undefined) ? moment(date).format('YYYY-MM-DD') : Error('No date provided');

const datesArray = (middleDate) => {
    if (middleDate === undefined) {
        throw Error('No date provided');
    }
    let datesArray = [moment(middleDate).add(-2, 'd'), moment(middleDate).add(-1, 'd'), moment(middleDate),
        moment(middleDate).add(1, 'd'), moment(middleDate).add(2, 'd')];
    return datesArray.map(date => formatDate(date));
};

const getTime = (date) =>
    (date !== undefined) ? moment(date).format('h:mmA') : Error('No date provided');

const minutesToHoursAndMinutes = (minutes) => {
    if (minutes === undefined) {
        throw Error('No flight duration minutes provided');
    }
    const hours = Math.floor(minutes/60);
    let mins = minutes % 60;
    mins = mins.toString();
    mins = mins.length === 1 ? '0' + mins : mins;
    return hours.toString() + ':' + mins;
};

module.exports = {
    formatDate,
    datesArray,
    getTime,
    minutesToHoursAndMinutes
};