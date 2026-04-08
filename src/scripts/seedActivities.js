const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const Partner = require("../models/Partner");

// Utilitário para datas futuras
function getFutureDate(days, hour, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, min, 0, 0);
  return d;
}

async function seedActivities() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost/fitlife-pass");

  // Limpar atividades antigas fictícias
  await Activity.deleteMany({ partnerName: /Studio|Club|Box|Lab|Elite|Flow|Bowl|Fight|Ride|Green/i });

  // Buscar partners reais
  const partners = await Partner.find({});
  if (!partners.length) throw new Error("Nenhum partner encontrado. Corre primeiro o seed de partners.");

  // Mapear partners por slug para fácil referência
  const bySlug = Object.fromEntries(partners.map(p => [p.slug, p]));

  // Lista de atividades fictícias por partner
  const activitiesSeed = [
    // Gym Lisboa Central
    {
      title: "Ginásio livre",
      type: "gym",
      creditsCost: 6,
      city: "Lisboa",
      address: "Av. da República 50",
      partnerSlug: "gym-lisboa-central",
      sessions: [
        { days: [0,1,2,3,4,5,6], hour: 7, duration: 60 },
        { days: [0,1,2,3,4,5,6], hour: 18, duration: 90 },
      ],
    },
    // CrossFit Porto Box
    {
      title: "Aula de CrossFit WOD",
      type: "crossfit",
      creditsCost: 10,
      city: "Porto",
      address: "Rua do Heroísmo 100",
      partnerSlug: "crossfit-porto-box",
      sessions: [
        { days: [1,3,5], hour: 19, duration: 60 },
        { days: [2,4], hour: 7, duration: 60 },
      ],
    },
    // Pilates Studio Lisboa
    {
      title: "Pilates Solo",
      type: "pilates",
      creditsCost: 8,
      city: "Lisboa",
      address: "Rua do Sol 12",
      partnerSlug: "pilates-studio-lisboa",
      sessions: [
        { days: [1,3,5], hour: 8, duration: 60 },
        { days: [2,4], hour: 18, duration: 60 },
      ],
    },
    // ... (adicionar mais atividades para outros partners)
  ];

  // Gerar sessões para os próximos 10 dias
  const activities = [];
  for (const seed of activitiesSeed) {
    const partner = bySlug[seed.partnerSlug];
    if (!partner) continue;
    for (let day = 0; day < 10; day++) {
      for (const sess of seed.sessions) {
        if (sess.days.includes((new Date().getDay() + day) % 7)) {
          const date = getFutureDate(day, sess.hour);
          activities.push({
            title: seed.title,
            type: seed.type,
            creditsCost: seed.creditsCost,
            city: seed.city,
            address: seed.address,
            partnerName: partner.name,
            active: true,
            lat: partner.latitude,
            lng: partner.longitude,
            date,
            duration: sess.duration,
          });
        }
      }
    }
  }

  await Activity.insertMany(activities);
  console.log(`Seeded ${activities.length} activities.`);
  await mongoose.disconnect();
}

seedActivities().catch(e => { console.error(e); process.exit(1); });
