import { gql } from 'apollo-server';

export const typeDefs = gql`
  enum SimulationStatus {
    RUNNING
    COMPLETED
    FAILED
  }

  type ChargingValuesPerHour {
    hour: String!
    chargepoints: [Float!]!
    kW: Float!
  }

  type ChargingEvents {
    year: Int!
    month: Int!
    week: Int!
    day: Int!
  }

  type SimulationResult {
    totalEnergyCharged: Float!
    chargingValuesPerHour: [ChargingValuesPerHour!]!
    chargingEvents: ChargingEvents!
  }

  type Simulation {
    id: ID!
    numChargePoints: Int!
    arrivalMultiplier: Float!
    carConsumption: Float!
    chargingPower: Float!
    status: SimulationStatus!
    results: [SimulationResult!]!
  }

  type SimulationStatusResult {
    status: SimulationStatus!
  }

  type Query {
    health: String
    simulations: [Simulation!]!
    simulation(id: ID!): Simulation
  }

  type Mutation {
    runSimulation(id: ID!): SimulationStatusResult!
    createSimulation(
      numChargePoints: Int!
      arrivalMultiplier: Float!
      carConsumption: Float!
      chargingPower: Float!
    ): Simulation!
    updateSimulation(
      id: ID!
      numChargePoints: Int
      arrivalMultiplier: Float
      carConsumption: Float
      chargingPower: Float
    ): Simulation!
    deleteSimulation(id: ID!): Simulation!
  }
`;
