
require('dotenv').config(); // 1. Carregar variáveis do .env
const mongoose = require('mongoose');

// 2. Usar apenas a variável do backend
const MONGODB_URI = process.env.MONGODB_URI;

const Activity = require('./src/models/Activity'); // 4. Usar o model real

const activities = [
  {
    title: 'Gym Session',
    type: 'gym',
    creditsCost: 6,
    city: 'Lisboa',
    address: 'Av. da República 50',
    partnerName: 'FitClub Lisboa',
    active: true,
  },
  {
    title: 'Pilates Solo',
    type: 'pilates',
    creditsCost: 8,
    city: 'Lisboa',
    address: 'Rua do Sol 12',
    partnerName: 'Pilates Studio Lisboa',
    active: true,
  },
  {
    title: 'Pilates Reformer',
    type: 'pilates_reformer',
    creditsCost: 10,
    city: 'Lisboa',
    address: 'Rua do Sol 12',
    partnerName: 'Reformer Club Lisboa',
    active: true,
  },
  {
    title: 'Crossfit WOD',
    type: 'crossfit',
    creditsCost: 10,
    city: 'Porto',
    address: 'Rua do Heroísmo 100',
    partnerName: 'CrossFit Porto Box',
    active: true,
  },
  {
    title: 'Padel Court',
    type: 'padel',
    creditsCost: 12,
    city: 'Lisboa',
    address: 'Rua do Padel 10',
    partnerName: 'Padel Club Lisboa',
    active: true,
  },
  {
    title: 'Personal Training',
    type: 'personal_training',
    creditsCost: 15,
    city: 'Porto',
    address: 'Rua do PT 5',
    partnerName: 'PT Elite Porto',
    active: true,
  },
  {
    title: 'Yoga Flow',
    type: 'yoga',
    creditsCost: 8,
    city: 'Lisboa',
    address: 'Rua do Yoga 8',
    partnerName: 'Yoga Flow Lisboa',
    active: true,
  },
  {
    title: 'Boxing Class',
    type: 'boxing',
    creditsCost: 10,
    city: 'Braga',
    address: 'Rua do Boxe 3',
    partnerName: 'Fight & Functional Braga',
    active: true,
  },
  {
    title: 'Swimming Session',
    type: 'swimming',
    creditsCost: 7,
    city: 'Lisboa',
    address: 'Rua da Piscina 1',
    partnerName: 'Blue Water Center',
    active: true,
  },
  {
    title: 'Healthy Lunch',
    type: 'healthy_food',
    creditsCost: 5,
    city: 'Lisboa',
    address: 'Rua Verde 2',
    partnerName: 'Green Bowl Lisboa',
    active: true,
  }
];

async function seed() {
  if (!MONGODB_URI || !MONGODB_URI.trim()) {
    console.error('❌ MONGODB_URI não está definida no .env');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI.trim()); // 2. Usar exatamente a mesma ligação
  console.log('Mongo connected');
  await Activity.deleteMany({}); // 5. Limpar coleção
  await Activity.insertMany(activities); // 5. Inserir seed
  const count = await Activity.countDocuments();
  console.log('Activity count after seed:', count);
  const sample = await Activity.findOne().lean();
  console.log('Sample activity:', sample);
  console.log('Seed done');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
