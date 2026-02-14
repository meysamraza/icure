
const isSunday = (dateString) => {
    const date = new Date(dateString + 'T00:00:00Z');
    console.log(`Date input: ${dateString}`);
    console.log(`Parsed Date (ISO): ${date.toISOString()}`);
    console.log(`getUTCDay(): ${date.getUTCDay()}`);
    return date.getUTCDay() === 0;
};

const dateToCheck = '2026-02-15';
console.log(`Is ${dateToCheck} a Sunday? ${isSunday(dateToCheck)}`);

const today = new Date();
console.log(`Current System Date: ${today.toISOString()}`);
console.log(`Current System Day: ${today.getDay()}`);
