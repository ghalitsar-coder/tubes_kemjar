#!/bin/bash
# Script to seed the database with medical data (doctors, specialties, etc.)

echo "Running medical data seeding script..."
node prisma/seed-medical.js

echo "Done!"
