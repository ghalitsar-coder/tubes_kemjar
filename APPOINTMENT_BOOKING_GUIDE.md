# Appointment Booking System Guide

This document provides an overview of the appointment booking system implemented in our healthcare application. This feature allows patients to book appointments with doctors based on their specialties and availability.

## Getting Started

To run the appointment booking system:

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Seed the database with test data**:

   ```bash
   # Windows
   .\seed-medical.bat

   # Linux/Mac
   ./seed-medical.sh
   ```

3. **Access the booking interface**:
   - Navigate to: `http://localhost:3000/appointments/book`
   - You'll need to be logged in as a patient to access this page
   - You must have a complete patient profile before booking appointments

## Components Structure

The appointment booking system is composed of the following components:

1. **BookAppointmentPage** - The main component that orchestrates the multi-step booking flow
2. **DoctorSelection** - Component for choosing a doctor with specialty filtering
3. **DateTimeSelection** - Component for selecting available dates and time slots
4. **AppointmentConfirmation** - Component for confirming appointment details

## Key Features

- **Patient Profile Validation**: System checks if patient has completed their medical profile
- **Doctor Search & Filtering**: Search for doctors by name or specialty, and filter by medical specialties
- **Interactive Calendar**: Select appointment dates from an interactive calendar showing available days
- **Time Slot Selection**: Choose from available time slots based on doctor's schedule
- **Appointment Type Selection**: Select from in-person, video call, or phone call appointment types
- **Multi-step Process**: User-friendly step-by-step booking workflow with back navigation

## API Endpoints

The system uses the following API endpoints:

- `GET /api/doctors` - Fetch all doctors, optionally including specialty information
- `GET /api/specialties` - Get all medical specialties
- `GET /api/doctors/:doctorId/availability` - Get available appointment slots for a specific doctor
- `POST /api/appointments` - Book a new appointment
- `GET /api/patient/profile` - Check if the current patient has a complete profile
- `POST /api/patient/profile` - Create or update patient profile information

## Debugging Common Issues

### Problem: "Failed to fetch doctor availability"

This error occurs when the availability API endpoint encounters an issue. Check:

1. Make sure the doctor exists in the database
2. Ensure the doctor has a schedule defined for the selected day
3. Check that the API parameters are correctly formatted:
   - `doctorId` must be a valid number
   - `date` must be in YYYY-MM-DD format
   - `dayOfWeek` must be a number (0-6, where 0 is Sunday)

### Problem: "Failed to book appointment"

This error occurs when the appointment booking process fails. Check:

1. Ensure all required fields are provided (doctorId, date, startTime, endTime, reason)
2. Verify the selected time slot is still available (it may have been booked by another user)
3. Check that the user is authenticated as a patient
4. Verify the patient has completed their patient profile

### Problem: "Patient profile required"

This error occurs when a patient attempts to book an appointment without completing their profile:

1. Make sure the patient has filled out the required profile information
2. Redirect the patient to `/profile/edit` to complete their profile
3. Once the profile is complete, they can continue with booking

- `GET /api/doctors/[doctorId]/availability` - Check a doctor's availability for a specific date
- `POST /api/appointments` - Create a new appointment booking

## Database Models

The booking system uses the following Prisma models:

- `User` - Contains basic user information
- `Patient` - Patient profile with medical information
- `Doctor` - Doctor profile including specialization
- `DoctorSpecialty` - Many-to-many relation between doctors and specialties
- `Specialty` - Medical specialties
- `Schedule` - Doctor's weekly schedule
- `Appointment` - Stored appointment information

## Booking Flow

1. **Patient Profile Check**:

   - System verifies that the patient has completed their medical profile
   - If not complete, redirects to profile edit page
   - Only patients with complete profiles can proceed

2. **Doctor Selection**:

   - Browse and search for doctors
   - Filter by specialty
   - View doctor details and select a doctor

3. **Date & Time Selection**:

   - Select a date from the calendar
   - Choose an available time slot from the doctor's schedule

4. **Appointment Confirmation**:
   - Enter reason for visit and optional notes
   - Select appointment type (In-person, Video call, Phone call)
   - Confirm and book the appointment

## Adding New Specialties

To add new specialties to the system, you can use Prisma's database operations or the Prisma Studio UI:

```typescript
await prisma.specialty.create({
  data: {
    name: "New Specialty",
    description: "Description of the new specialty",
  },
});
```

## Customization

The appointment booking system is designed to be customizable:

- Update the UI components in the `src/components/base-appointment-page` directory
- Modify the API logic in the `src/app/api` endpoints
- Extend the database schema in `prisma/schema.prisma` as needed

## Testing the Implementation

To test the appointment booking system:

1. **Seed the database with test data**:

   - Run the provided seed script: `./seed-medical.bat` (Windows) or `./seed-medical.sh` (Linux/Mac)
   - This will create test doctors, specialties, and schedules

2. **Navigate to the booking page**:

   - Go to `/appointments/book` in your application
   - You should see the doctor selection interface

3. **Complete the booking flow**:

   - Select a doctor
   - Choose a date and time slot
   - Fill out the appointment details
   - Submit the form

4. **Verify the appointment**:
   - You should be redirected to the appointments list page
   - A success message should appear at the top of the page
   - The new appointment should be displayed in the list

## Troubleshooting

Common issues:

1. **No doctors appearing**:

   - Ensure the database has doctor entries by running the seed script
   - Check the browser console for API errors
   - Verify that `/api/doctors` endpoint is working correctly

2. **No available time slots**:

   - Check if doctors have schedules set up in the database
   - Make sure the doctor has availability for the selected day of week
   - Check the browser console for errors with the availability API call

3. **Booking errors**:
   - Check the browser console and server logs for API errors
   - Verify that the `/api/appointments` endpoint is properly handling POST requests
   - Check that all required fields are being submitted correctly
