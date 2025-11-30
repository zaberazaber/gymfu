import { pgPool as pool } from '../config/database';
import InstructorModel from '../models/Instructor';
import ClassModel from '../models/Class';

async function seedClasses() {
  try {
    console.log('🌱 Seeding instructors and classes...');

    // First, check if we have any gyms
    const gymsResult = await pool.query('SELECT id FROM gyms LIMIT 3');
    if (gymsResult.rows.length === 0) {
      console.error('❌ No gyms found. Please seed gyms first.');
      process.exit(1);
    }

    const gymIds = gymsResult.rows.map(row => row.id);
    console.log(`Found ${gymIds.length} gyms`);

    // Create instructors
    const instructors = [
      {
        name: 'Priya Sharma',
        bio: 'Certified yoga instructor with 10 years of experience in Hatha and Vinyasa yoga.',
        specialization: 'Yoga',
        rating: 4.8,
        profileImage: 'https://i.pravatar.cc/150?img=1',
      },
      {
        name: 'Rahul Mehta',
        bio: 'Professional Zumba instructor bringing energy and fun to every class.',
        specialization: 'Zumba',
        rating: 4.7,
        profileImage: 'https://i.pravatar.cc/150?img=12',
      },
      {
        name: 'Anjali Desai',
        bio: 'Contemporary dance instructor with a passion for creative movement.',
        specialization: 'Dance',
        rating: 4.9,
        profileImage: 'https://i.pravatar.cc/150?img=5',
      },
      {
        name: 'Vikram Singh',
        bio: 'CrossFit Level 2 trainer focused on functional fitness and strength building.',
        specialization: 'CrossFit',
        rating: 4.6,
        profileImage: 'https://i.pravatar.cc/150?img=13',
      },
      {
        name: 'Neha Kapoor',
        bio: 'Pilates instructor specializing in core strength and flexibility.',
        specialization: 'Pilates',
        rating: 4.8,
        profileImage: 'https://i.pravatar.cc/150?img=9',
      },
      {
        name: 'Arjun Patel',
        bio: 'Spinning instructor with high-energy classes and motivating playlists.',
        specialization: 'Spinning',
        rating: 4.7,
        profileImage: 'https://i.pravatar.cc/150?img=14',
      },
    ];

    const createdInstructors = [];
    for (const instructor of instructors) {
      const created = await InstructorModel.create(instructor);
      createdInstructors.push(created);
      console.log(`✅ Created instructor: ${created.name}`);
    }

    // Create classes
    const classes = [
      {
        gymId: gymIds[0],
        instructorId: createdInstructors[0].id,
        name: 'Morning Hatha Yoga',
        type: 'yoga' as const,
        schedule: [
          { dayOfWeek: 1, startTime: '07:00', endTime: '08:00' },
          { dayOfWeek: 3, startTime: '07:00', endTime: '08:00' },
          { dayOfWeek: 5, startTime: '07:00', endTime: '08:00' },
        ],
        capacity: 20,
        price: 300,
        description: 'Start your day with energizing yoga poses and breathing exercises.',
      },
      {
        gymId: gymIds[0],
        instructorId: createdInstructors[1].id,
        name: 'Zumba Fitness Party',
        type: 'zumba' as const,
        schedule: [
          { dayOfWeek: 2, startTime: '18:00', endTime: '19:00' },
          { dayOfWeek: 4, startTime: '18:00', endTime: '19:00' },
          { dayOfWeek: 6, startTime: '10:00', endTime: '11:00' },
        ],
        capacity: 30,
        price: 350,
        description: 'High-energy dance fitness class with Latin and international music.',
      },
      {
        gymId: gymIds[1] || gymIds[0],
        instructorId: createdInstructors[2].id,
        name: 'Contemporary Dance Workshop',
        type: 'dance' as const,
        schedule: [
          { dayOfWeek: 0, startTime: '16:00', endTime: '17:30' },
          { dayOfWeek: 6, startTime: '14:00', endTime: '15:30' },
        ],
        capacity: 15,
        price: 400,
        description: 'Explore creative movement and expression through contemporary dance.',
      },
      {
        gymId: gymIds[1] || gymIds[0],
        instructorId: createdInstructors[3].id,
        name: 'CrossFit WOD',
        type: 'crossfit' as const,
        schedule: [
          { dayOfWeek: 1, startTime: '06:00', endTime: '07:00' },
          { dayOfWeek: 3, startTime: '06:00', endTime: '07:00' },
          { dayOfWeek: 5, startTime: '06:00', endTime: '07:00' },
        ],
        capacity: 12,
        price: 500,
        description: 'Intense functional fitness workout of the day for all levels.',
      },
      {
        gymId: gymIds[2] || gymIds[0],
        instructorId: createdInstructors[4].id,
        name: 'Pilates Core Strength',
        type: 'pilates' as const,
        schedule: [
          { dayOfWeek: 2, startTime: '09:00', endTime: '10:00' },
          { dayOfWeek: 4, startTime: '09:00', endTime: '10:00' },
        ],
        capacity: 15,
        price: 350,
        description: 'Build core strength and improve flexibility with controlled movements.',
      },
      {
        gymId: gymIds[2] || gymIds[0],
        instructorId: createdInstructors[5].id,
        name: 'Spinning Cardio Blast',
        type: 'spinning' as const,
        schedule: [
          { dayOfWeek: 1, startTime: '19:00', endTime: '20:00' },
          { dayOfWeek: 3, startTime: '19:00', endTime: '20:00' },
          { dayOfWeek: 5, startTime: '19:00', endTime: '20:00' },
        ],
        capacity: 25,
        price: 300,
        description: 'High-intensity indoor cycling class with motivating music.',
      },
      {
        gymId: gymIds[0],
        instructorId: createdInstructors[0].id,
        name: 'Evening Vinyasa Flow',
        type: 'yoga' as const,
        schedule: [
          { dayOfWeek: 2, startTime: '19:30', endTime: '20:30' },
          { dayOfWeek: 4, startTime: '19:30', endTime: '20:30' },
        ],
        capacity: 20,
        price: 300,
        description: 'Dynamic yoga flow connecting breath with movement.',
      },
      {
        gymId: gymIds[1] || gymIds[0],
        instructorId: createdInstructors[1].id,
        name: 'Weekend Zumba Special',
        type: 'zumba' as const,
        schedule: [
          { dayOfWeek: 0, startTime: '11:00', endTime: '12:00' },
        ],
        capacity: 35,
        price: 400,
        description: 'Special weekend Zumba session with extended playlist.',
      },
    ];

    for (const classData of classes) {
      const created = await ClassModel.create(classData);
      console.log(`✅ Created class: ${created.name} (${created.type})`);
    }

    console.log('\n🎉 Successfully seeded instructors and classes!');
    console.log(`   - ${createdInstructors.length} instructors created`);
    console.log(`   - ${classes.length} classes created`);
    
  } catch (error) {
    console.error('❌ Error seeding classes:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedClasses()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedClasses;
