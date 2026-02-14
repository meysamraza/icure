// Generate slots from 10:00 AM to 10:00 PM in 30-min intervals
function generateTimeSlots() {
  const slots = [];
  let currentTime = new Date();
  currentTime.setHours(10, 0, 0, 0); // Start at 10:00 AM

  const endTime = new Date();
  endTime.setHours(22, 0, 0, 0); // End at 10:00 PM

  while (currentTime < endTime) {
    // Format: "HH:MM"
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }

  return slots;
}

module.exports = { generateTimeSlots };
