
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('Starting Backend Verification Tests...');

    let patientToken = '';
    let doctorToken = '';
    const testPatient = {
        username: `testpatient_${Date.now()}`,
        password: 'password123',
        full_name: 'Test Patient',
        phone: '1234567890',
        whatsapp_number: '1234567890'
    };

    try {
        // 1. Test Signup
        console.log('\n--- Testing Patient Signup ---');
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPatient)
        });
        const signupData = await signupRes.json();
        if (signupRes.ok) {
            console.log('✅ Signup successful');
            patientToken = signupData.token;
        } else {
            console.error('❌ Signup failed:', signupData);
        }

        // 2. Test Doctor Login
        console.log('\n--- Testing Doctor Login ---');
        const docLoginRes = await fetch(`${BASE_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'NoreenAbid', password: 'passdoc123' })
        });
        const docLoginData = await docLoginRes.json();
        if (docLoginRes.ok) {
            console.log('✅ Doctor login successful');
            doctorToken = docLoginData.token;
        } else {
            console.error('❌ Doctor login failed:', docLoginData);
        }

        // 3. Test Available Slots (Checking the isSunday fix)
        const testDate = '2026-02-16'; // Monday
        const sundayDate = '2026-02-15'; // Sunday

        console.log('\n--- Testing Available Slots (Monday) ---');
        const slotsRes = await fetch(`${BASE_URL}/appointments/available-slots?date=${testDate}`);
        const slotsData = await slotsRes.json();
        console.log(`Slots for ${testDate}:`, slotsData.slots ? `${slotsData.slots.length} slots found` : 'Error');

        console.log('\n--- Testing Available Slots (Sunday) ---');
        const sundayRes = await fetch(`${BASE_URL}/appointments/available-slots?date=${sundayDate}`);
        const sundayData = await sundayRes.json();
        console.log(`Response for Sunday ${sundayDate}:`, sundayData.message);

        // 4. Test Appointment Booking
        console.log('\n--- Testing Appointment Booking ---');
        const bookRes = await fetch(`${BASE_URL}/appointments/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${patientToken}`
            },
            body: JSON.stringify({
                appointment_date: testDate,
                appointment_time: '10:00',
                patient_notes: 'Initial test appointment'
            })
        });
        const bookData = await bookRes.json();
        if (bookRes.status === 201) {
            console.log('✅ Appointment booked successfully');
            const appointmentId = bookData.appointment.id;

            // 5. Doctor Approve Appointment
            console.log('\n--- Testing Doctor Approve ---');
            const approveRes = await fetch(`${BASE_URL}/appointments/${appointmentId}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${doctorToken}` }
            });
            if (approveRes.ok) console.log('✅ Appointment approved');

            // 6. Doctor Complete Appointment
            console.log('\n--- Testing Doctor Complete ---');
            const completeRes = await fetch(`${BASE_URL}/appointments/${appointmentId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${doctorToken}`
                },
                body: JSON.stringify({ doctor_notes: 'Consultation finished.' })
            });
            if (completeRes.ok) console.log('✅ Appointment completed');

            // 7. Test Review Submission
            console.log('\n--- Testing Review Submission ---');
            const reviewRes = await fetch(`${BASE_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${patientToken}`
                },
                body: JSON.stringify({ rating: 5, review_text: 'Excellent care!' })
            });
            if (reviewRes.ok) console.log('✅ Review submitted successfully');
            else console.error('❌ Review failed:', await reviewRes.json());
        } else {
            console.error('❌ Booking failed:', bookData);
        }

        console.log('\n--- Verification Tests Completed ---');

    } catch (error) {
        console.error('Test script error:', error);
    }
}

runTests();
