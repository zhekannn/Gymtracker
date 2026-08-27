// import 'reflect-metadata';
// import { AppDataSource } from './data-source.js';
// import { Exercise } from './entities/Exercise.js';
// import dotenv from "dotenv";
// dotenv.config();
// const exercisesData: Partial<Exercise>[] = [
//   // --- ГРУДЬ ---
//   {
//     name: 'Жим штанги лежа',
//     muscleGroup: 'Грудь',
//     description: 'Базовое упражнение для развития мышц груди, передних дельт и трицепсов.',
//     imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'
//   },
//   {
//     name: 'Жим гантелей на наклонной скамье',
//     muscleGroup: 'Грудь',
//     description: 'Акцентирует нагрузку на верхнюю часть грудных мышц.',
//     imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
//   },
//   {
//     name: 'Отжимания на брусьях',
//     muscleGroup: 'Грудь',
//     description: 'Отличное упражнение для нижней части груди и трицепсов.',
//     imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500'
//   },
//   {
//     name: 'Сведение рук в кроссовере',
//     muscleGroup: 'Грудь',
//     description: 'Изолирующее упражнение для проработки и растяжения грудных мышц.',
//     imageUrl: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=500'
//   },

//   // --- СПИНА ---
//   {
//     name: 'Подтягивания широким хватом',
//     muscleGroup: 'Спина',
//     description: 'Базовое упражнение для развития широчайших мышц спины.',
//     imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500'
//   },
//   {
//     name: 'Тяга штанги в наклоне',
//     muscleGroup: 'Спина',
//     description: 'Прорабатывает толщину спины, широчайшие и ромбовидные мышцы.',
//     imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500'
//   },
//   {
//     name: 'Тяга верхнего блока к груди',
//     muscleGroup: 'Спина',
//     description: 'Отличная альтернатива подтягиваниям для акцента на ширину спины.',
//     imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
//   },
//   {
//     name: 'Тяга горизонтального блока',
//     muscleGroup: 'Спина',
//     description: 'Акцентирует нагрузку на середину спины и ромбовидные мышцы.',
//     imageUrl: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=500'
//   },
//   {
//     name: 'Гиперэкстензия',
//     muscleGroup: 'Спина',
//     description: 'Укрепляет мышцы-разгибатели позвоночника и ягодицы.',
//     imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'
//   },

//   // --- НОГИ ---
//   {
//     name: 'Приседания со штангой',
//     muscleGroup: 'Ноги',
//     description: 'Главное базовое упражнение для развития квадрицепсов и ягодиц.',
//     imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500'
//   },
//   {
//     name: 'Жим ногами в тренажере',
//     muscleGroup: 'Ноги',
//     description: 'Позволяет безопасно проработать мышцы ног с большим весом.',
//     imageUrl: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=500'
//   },
//   {
//     name: 'Румынская тяга',
//     muscleGroup: 'Ноги',
//     description: 'Акцентирует нагрузку на бицепс бедра и ягодичные мышцы.',
//     imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500'
//   },
//   {
//     name: 'Выпады с гантелями',
//     muscleGroup: 'Ноги',
//     description: 'Отличное одностороннее упражнение для квадрицепсов и ягодиц.',
//     imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
//   },
//   {
//     name: 'Сгибание ног в тренажере',
//     muscleGroup: 'Ноги',
//     description: 'Изолированное упражнение для бицепса бедра.',
//     imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'
//   },

//   // --- ПЛЕЧИ ---
//   {
//     name: 'Армейский жим (Жим штанги стоя)',
//     muscleGroup: 'Плечи',
//     description: 'Базовое упражнение для развития передних и средних пучков дельт.',
//     imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500'
//   },
//   {
//     name: 'Махи гантелями через стороны',
//     muscleGroup: 'Плечи',
//     description: 'Изолирующее упражнение для акцента на средний пучок дельт.',
//     imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
//   },
//   {
//     name: 'Махи гантелями в наклоне',
//     muscleGroup: 'Плечи',
//     description: 'Прорабатывает задний пучок дельтовидных мышц.',
//     imageUrl: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=500'
//   },

//   // --- РУКИ ---
//   {
//     name: 'Подъем штанги на бицепс',
//     muscleGroup: 'Руки',
//     description: 'Классическое упражнение для наращивания массы бицепса.',
//     imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
//   },
//   {
//     name: 'Молотковые сгибания (Хаммер)',
//     muscleGroup: 'Руки',
//     description: 'Развивает бицепс и плечевую мышцу (брахиалис).',
//     imageUrl: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=500'
//   },
//   {
//     name: 'Французский жим лежа',
//     muscleGroup: 'Руки',
//     description: 'Изолирующее упражнение для всех трех головок трицепса.',
//     imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'
//   },
//   {
//     name: 'Разгибание рук на блоке',
//     muscleGroup: 'Руки',
//     description: 'Отличное упражнение для изолированной проработки трицепса.',
//     imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500'
//   },

//   // --- ПРЕСС ---
//   {
//     name: 'Скручивания на полу',
//     muscleGroup: 'Пресс',
//     description: 'Базовое упражнение для верхней части прямой мышцы живота.',
//     imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'
//   },
//   {
//     name: 'Подъем ног в висе',
//     muscleGroup: 'Пресс',
//     description: 'Эффективное упражнение для нижней части пресса и мышц кора.',
//     imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500'
//   },
//   {
//     name: 'Планка',
//     muscleGroup: 'Пресс',
//     description: 'Изометрическое упражнение для укрепления всех мышц кора.',
//     imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'
//   }
// ];

// async function seed() {
//   try {
//     console.log('⏳ Подключение к базе данных Supabase...');
//     await AppDataSource.initialize();
//     console.log('✅ Подключение установлено.');

//     const exerciseRepository = AppDataSource.getRepository(Exercise);

//     console.log('🧹 Очистка старых данных...');
//     await exerciseRepository.clear();

//     console.log('🌱 Наполнение Supabase упражнениями...');
//     for (const data of exercisesData) {
//       const exercise = exerciseRepository.create(data);
//       await exerciseRepository.save(exercise);
//     }

//     console.log(`🎉 Готово! Успешно добавлено ${exercisesData.length} упражнений.`);
//   } catch (error) {
//     console.error('❌ Ошибка при выполнении сида:', error);
//   } finally {
//     await AppDataSource.destroy();
//     process.exit(0);
//   }
// }

// seed();
import { AppDataSource } from "./data-source.js";

async function testConnection() {
  try {
    console.log("⏳ Попытка подключения к Supabase...");
    await AppDataSource.initialize();
    console.log("✅ Успешное подключение к базе данных!");
    console.log("🎉 Все таблицы успешно синхронизированы в Supabase!");
  } catch (error) {
    console.error("❌ Ошибка при подключении к БД:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  }
}

testConnection();