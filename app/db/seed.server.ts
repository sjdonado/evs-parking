import 'dotenv/config';

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import { faker } from '@faker-js/faker';

import { connectToDatabase } from './database.server';
import { simulationsResultsTable, simulationsTable } from './tables.server';

const SEED_SIZE = 10;

const seedSimulations = async (db: BetterSQLite3Database) => {
  const data = [];

  for (let i = 0; i < SEED_SIZE; i++) {
    data.push({
      numChargePoints: faker.number.int({ min: 5, max: 30 }),
      arrivalMultiplier: faker.number.float({ min: 0.2, max: 2.0 }),
      carConsumption: faker.number.int({ min: 10, max: 20 }),
      chargingPower: faker.number.int({ min: 8, max: 16 }),
    });
  }

  const result = await db
    .insert(simulationsTable)
    .values(data)
    .onConflictDoNothing()
    .returning();

  return result;
};

const seedSimulationsResults = async (db: BetterSQLite3Database) => {
  const simulations = await db.select().from(simulationsTable);

  const data = [];

  for (const simulation of simulations) {
    const chargingEvents = Math.ceil(Math.random() * simulation.numChargePoints);

    const jobResults = {
      totalEnergyConsumed:
        chargingEvents * simulation.arrivalMultiplier * simulation.chargingPower,
      chargingValuesPerHour: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        chargepoints: Array.from({ length: simulation.numChargePoints }, () =>
          Number((Math.random() * simulation.carConsumption).toFixed(2))
        ),
        total: Math.random() * simulation.arrivalMultiplier,
      })),
      chargingEvents: {
        year: chargingEvents * 24 * 365,
        month: Array(chargingEvents * 24 * 30).fill(1),
        week: Array(chargingEvents * 24 * 7).fill(1),
        day: Array(chargingEvents * 24).fill(1),
      },
    };

    data.push({
      simulationId: simulation.id,
      ...jobResults,
    });
  }

  const result = await db
    .insert(simulationsResultsTable)
    .values(data)
    .onConflictDoNothing()
    .returning();

  return result;
};

const main = async () => {
  const client = connectToDatabase();
  const db = drizzle(client);

  const args = process.argv.slice(2);

  if (args.includes('simulations') || args.includes('all')) {
    const simulations = await seedSimulations(db);
    console.log('[seedSimulations]', simulations, `Total: ${simulations.length}`);
  }

  if (args.includes('simulations_results') || args.includes('all')) {
    const simulationResults = await seedSimulationsResults(db);
    console.log(
      '[seedSimulationsResults]',
      simulationResults,
      `Total: ${simulationResults.length}`
    );
  }

  client.close();
};

await main();
