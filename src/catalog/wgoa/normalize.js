const _lowerCase = require('lodash/lowerCase');
const _startCase = require('lodash/startCase');

function title(t) {
    return _startCase(_lowerCase(t));
}

function artist(theArtist) {
    let a = theArtist;

    // Make sure last name comes after first name.
    const regex = /(\w+), ?(.*)/;
    const match = a.match(regex);
    if (match) {
        a = `${match[2]} ${match[1]}`
    }

    a = _startCase(_lowerCase(a));

    return a;
}

function date(d) {
    // Possible inputs:
    // -
    // 1598
    // c. 1598
    // 1598-99
    // 1598-1599
    // 1598 (set up)
    // 1598 (completed)
    // 1590s
    // began c. 1598
    // begun c. 1598
    // begun 1460
    // c. 1400-1500
    // after 1455
    //
    return d;
}

function technique(t) {
    return t;
}

module.exports = {
    title,
    artist,
    date,
    technique,
};