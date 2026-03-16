/**
 * Election 2028 - Complete State Data
 * All 50 US States + District of Columbia
 * Electoral votes based on 2020 Census reapportionment (effective 2024-2032)
 * Partisan lean based on 2024 election results
 * Total electoral votes: 538
 */

window.StateData = [
  // ============================================================
  // KEY BATTLEGROUND STATES
  // ============================================================
  {
    id: "PA",
    name: "Pennsylvania",
    electoralVotes: 19,
    partisanLean: 4,
    swingVolatility: 65,
    isBattleground: true,
    demographics: { white: 75, black: 11, hispanic: 8, asian: 4, other: 2 },
    composition: { urban: 37, suburban: 40, rural: 23 },
    educationSplit: { college: 35, nonCollege: 65 },
    issueSalience: {
      economy: 90, immigration: 60, abortion: 70, crime: 65, cultureWar: 50,
      labor: 80, energy: 75, healthcare: 72, education: 60, gunPolicy: 55
    },
    adCostMultiplier: 1.5,
    turnoutPotential: 72,
    region: "northeast",
    keyCity: "Philadelphia",
    cx: 76, cy: 32
  },
  {
    id: "MI",
    name: "Michigan",
    electoralVotes: 15,
    partisanLean: 5,
    swingVolatility: 62,
    isBattleground: true,
    demographics: { white: 74, black: 14, hispanic: 6, asian: 3, other: 3 },
    composition: { urban: 35, suburban: 38, rural: 27 },
    educationSplit: { college: 32, nonCollege: 68 },
    issueSalience: {
      economy: 92, immigration: 55, abortion: 65, crime: 62, cultureWar: 45,
      labor: 85, energy: 65, healthcare: 70, education: 62, gunPolicy: 50
    },
    adCostMultiplier: 1.2,
    turnoutPotential: 70,
    region: "midwest",
    keyCity: "Detroit",
    cx: 66, cy: 26
  },
  {
    id: "WI",
    name: "Wisconsin",
    electoralVotes: 10,
    partisanLean: 3,
    swingVolatility: 60,
    isBattleground: true,
    demographics: { white: 80, black: 6, hispanic: 7, asian: 3, other: 4 },
    composition: { urban: 30, suburban: 35, rural: 35 },
    educationSplit: { college: 33, nonCollege: 67 },
    issueSalience: {
      economy: 88, immigration: 55, abortion: 68, crime: 58, cultureWar: 50,
      labor: 82, energy: 60, healthcare: 72, education: 65, gunPolicy: 48
    },
    adCostMultiplier: 1.1,
    turnoutPotential: 74,
    region: "midwest",
    keyCity: "Milwaukee",
    cx: 58, cy: 24
  },
  {
    id: "GA",
    name: "Georgia",
    electoralVotes: 16,
    partisanLean: 6,
    swingVolatility: 55,
    isBattleground: true,
    demographics: { white: 52, black: 33, hispanic: 10, asian: 4, other: 1 },
    composition: { urban: 38, suburban: 37, rural: 25 },
    educationSplit: { college: 34, nonCollege: 66 },
    issueSalience: {
      economy: 88, immigration: 65, abortion: 72, crime: 70, cultureWar: 55,
      labor: 60, energy: 55, healthcare: 68, education: 62, gunPolicy: 58
    },
    adCostMultiplier: 1.2,
    turnoutPotential: 68,
    region: "southeast",
    keyCity: "Atlanta",
    cx: 70, cy: 55
  },
  {
    id: "AZ",
    name: "Arizona",
    electoralVotes: 11,
    partisanLean: 6,
    swingVolatility: 58,
    isBattleground: true,
    demographics: { white: 54, black: 5, hispanic: 32, asian: 4, other: 5 },
    composition: { urban: 40, suburban: 38, rural: 22 },
    educationSplit: { college: 33, nonCollege: 67 },
    issueSalience: {
      economy: 85, immigration: 92, abortion: 62, crime: 65, cultureWar: 50,
      labor: 55, energy: 60, healthcare: 65, education: 58, gunPolicy: 52
    },
    adCostMultiplier: 1.15,
    turnoutPotential: 65,
    region: "southwest",
    keyCity: "Phoenix",
    cx: 22, cy: 55
  },
  {
    id: "NV",
    name: "Nevada",
    electoralVotes: 6,
    partisanLean: 7,
    swingVolatility: 60,
    isBattleground: true,
    demographics: { white: 48, black: 10, hispanic: 30, asian: 9, other: 3 },
    composition: { urban: 45, suburban: 35, rural: 20 },
    educationSplit: { college: 27, nonCollege: 73 },
    issueSalience: {
      economy: 90, immigration: 72, abortion: 55, crime: 62, cultureWar: 42,
      labor: 78, energy: 55, healthcare: 70, education: 55, gunPolicy: 48
    },
    adCostMultiplier: 1.0,
    turnoutPotential: 60,
    region: "west",
    keyCity: "Las Vegas",
    cx: 15, cy: 42
  },
  {
    id: "NC",
    name: "North Carolina",
    electoralVotes: 16,
    partisanLean: 8,
    swingVolatility: 50,
    isBattleground: true,
    demographics: { white: 62, black: 22, hispanic: 10, asian: 3, other: 3 },
    composition: { urban: 32, suburban: 38, rural: 30 },
    educationSplit: { college: 35, nonCollege: 65 },
    issueSalience: {
      economy: 86, immigration: 62, abortion: 68, crime: 60, cultureWar: 55,
      labor: 58, energy: 58, healthcare: 65, education: 65, gunPolicy: 55
    },
    adCostMultiplier: 1.15,
    turnoutPotential: 67,
    region: "southeast",
    keyCity: "Charlotte",
    cx: 74, cy: 47
  },

  // ============================================================
  // ADDITIONAL COMPETITIVE STATES
  // ============================================================
  {
    id: "MN",
    name: "Minnesota",
    electoralVotes: 10,
    partisanLean: -2,
    swingVolatility: 45,
    isBattleground: true,
    demographics: { white: 79, black: 7, hispanic: 6, asian: 5, other: 3 },
    composition: { urban: 33, suburban: 37, rural: 30 },
    educationSplit: { college: 39, nonCollege: 61 },
    issueSalience: {
      economy: 82, immigration: 55, abortion: 62, crime: 60, cultureWar: 48,
      labor: 75, energy: 58, healthcare: 70, education: 68, gunPolicy: 50
    },
    adCostMultiplier: 1.05,
    turnoutPotential: 78,
    region: "midwest",
    keyCity: "Minneapolis",
    cx: 52, cy: 20
  },
  {
    id: "NH",
    name: "New Hampshire",
    electoralVotes: 4,
    partisanLean: -2,
    swingVolatility: 48,
    isBattleground: true,
    demographics: { white: 89, black: 2, hispanic: 4, asian: 3, other: 2 },
    composition: { urban: 22, suburban: 45, rural: 33 },
    educationSplit: { college: 40, nonCollege: 60 },
    issueSalience: {
      economy: 80, immigration: 48, abortion: 60, crime: 45, cultureWar: 42,
      labor: 55, energy: 50, healthcare: 68, education: 62, gunPolicy: 55
    },
    adCostMultiplier: 1.3,
    turnoutPotential: 75,
    region: "northeast",
    keyCity: "Manchester",
    cx: 84, cy: 18
  },
  {
    id: "ME",
    name: "Maine",
    electoralVotes: 4,
    partisanLean: -4,
    swingVolatility: 42,
    isBattleground: true,
    demographics: { white: 93, black: 2, hispanic: 2, asian: 1, other: 2 },
    composition: { urban: 18, suburban: 28, rural: 54 },
    educationSplit: { college: 35, nonCollege: 65 },
    issueSalience: {
      economy: 78, immigration: 42, abortion: 55, crime: 35, cultureWar: 40,
      labor: 65, energy: 55, healthcare: 72, education: 60, gunPolicy: 52
    },
    adCostMultiplier: 0.85,
    turnoutPotential: 73,
    region: "northeast",
    keyCity: "Portland",
    cx: 87, cy: 14
  },
  {
    id: "VA",
    name: "Virginia",
    electoralVotes: 13,
    partisanLean: -3,
    swingVolatility: 38,
    isBattleground: true,
    demographics: { white: 61, black: 20, hispanic: 10, asian: 7, other: 2 },
    composition: { urban: 36, suburban: 42, rural: 22 },
    educationSplit: { college: 42, nonCollege: 58 },
    issueSalience: {
      economy: 82, immigration: 58, abortion: 65, crime: 55, cultureWar: 52,
      labor: 55, energy: 50, healthcare: 62, education: 72, gunPolicy: 60
    },
    adCostMultiplier: 1.4,
    turnoutPotential: 70,
    region: "southeast",
    keyCity: "Virginia Beach",
    cx: 76, cy: 42
  },

  // ============================================================
  // SOLID DEMOCRATIC STATES
  // ============================================================
  {
    id: "CA",
    name: "California",
    electoralVotes: 54,
    partisanLean: -30,
    swingVolatility: 15,
    isBattleground: false,
    demographics: { white: 36, black: 6, hispanic: 40, asian: 15, other: 3 },
    composition: { urban: 45, suburban: 40, rural: 15 },
    educationSplit: { college: 36, nonCollege: 64 },
    issueSalience: {
      economy: 82, immigration: 70, abortion: 60, crime: 65, cultureWar: 55,
      labor: 68, energy: 72, healthcare: 75, education: 70, gunPolicy: 62
    },
    adCostMultiplier: 2.5,
    turnoutPotential: 62,
    region: "pacific",
    keyCity: "Los Angeles",
    cx: 8, cy: 42
  },
  {
    id: "NY",
    name: "New York",
    electoralVotes: 28,
    partisanLean: -22,
    swingVolatility: 18,
    isBattleground: false,
    demographics: { white: 55, black: 14, hispanic: 19, asian: 9, other: 3 },
    composition: { urban: 48, suburban: 32, rural: 20 },
    educationSplit: { college: 39, nonCollege: 61 },
    issueSalience: {
      economy: 85, immigration: 62, abortion: 58, crime: 70, cultureWar: 50,
      labor: 65, energy: 55, healthcare: 72, education: 65, gunPolicy: 60
    },
    adCostMultiplier: 2.8,
    turnoutPotential: 60,
    region: "northeast",
    keyCity: "New York City",
    cx: 80, cy: 28
  },
  {
    id: "IL",
    name: "Illinois",
    electoralVotes: 19,
    partisanLean: -18,
    swingVolatility: 18,
    isBattleground: false,
    demographics: { white: 61, black: 14, hispanic: 18, asian: 6, other: 1 },
    composition: { urban: 40, suburban: 38, rural: 22 },
    educationSplit: { college: 37, nonCollege: 63 },
    issueSalience: {
      economy: 85, immigration: 55, abortion: 58, crime: 72, cultureWar: 45,
      labor: 70, energy: 55, healthcare: 68, education: 65, gunPolicy: 65
    },
    adCostMultiplier: 1.6,
    turnoutPotential: 63,
    region: "midwest",
    keyCity: "Chicago",
    cx: 60, cy: 32
  },
  {
    id: "NJ",
    name: "New Jersey",
    electoralVotes: 14,
    partisanLean: -14,
    swingVolatility: 25,
    isBattleground: false,
    demographics: { white: 55, black: 13, hispanic: 21, asian: 10, other: 1 },
    composition: { urban: 35, suburban: 50, rural: 15 },
    educationSplit: { college: 42, nonCollege: 58 },
    issueSalience: {
      economy: 84, immigration: 58, abortion: 55, crime: 60, cultureWar: 42,
      labor: 62, energy: 48, healthcare: 68, education: 70, gunPolicy: 58
    },
    adCostMultiplier: 2.2,
    turnoutPotential: 64,
    region: "northeast",
    keyCity: "Newark",
    cx: 79, cy: 33
  },
  {
    id: "WA",
    name: "Washington",
    electoralVotes: 12,
    partisanLean: -22,
    swingVolatility: 15,
    isBattleground: false,
    demographics: { white: 67, black: 4, hispanic: 13, asian: 10, other: 6 },
    composition: { urban: 38, suburban: 40, rural: 22 },
    educationSplit: { college: 39, nonCollege: 61 },
    issueSalience: {
      economy: 78, immigration: 50, abortion: 55, crime: 58, cultureWar: 48,
      labor: 65, energy: 68, healthcare: 70, education: 65, gunPolicy: 55
    },
    adCostMultiplier: 1.4,
    turnoutPotential: 70,
    region: "pacific",
    keyCity: "Seattle",
    cx: 10, cy: 10
  },
  {
    id: "MA",
    name: "Massachusetts",
    electoralVotes: 11,
    partisanLean: -30,
    swingVolatility: 12,
    isBattleground: false,
    demographics: { white: 71, black: 9, hispanic: 12, asian: 7, other: 1 },
    composition: { urban: 42, suburban: 42, rural: 16 },
    educationSplit: { college: 47, nonCollege: 53 },
    issueSalience: {
      economy: 78, immigration: 45, abortion: 52, crime: 48, cultureWar: 40,
      labor: 60, energy: 58, healthcare: 75, education: 78, gunPolicy: 55
    },
    adCostMultiplier: 1.8,
    turnoutPotential: 68,
    region: "northeast",
    keyCity: "Boston",
    cx: 86, cy: 22
  },
  {
    id: "MD",
    name: "Maryland",
    electoralVotes: 10,
    partisanLean: -28,
    swingVolatility: 12,
    isBattleground: false,
    demographics: { white: 50, black: 31, hispanic: 11, asian: 7, other: 1 },
    composition: { urban: 35, suburban: 50, rural: 15 },
    educationSplit: { college: 42, nonCollege: 58 },
    issueSalience: {
      economy: 80, immigration: 50, abortion: 55, crime: 62, cultureWar: 42,
      labor: 58, energy: 48, healthcare: 68, education: 72, gunPolicy: 60
    },
    adCostMultiplier: 1.6,
    turnoutPotential: 67,
    region: "northeast",
    keyCity: "Baltimore",
    cx: 77, cy: 38
  },
  {
    id: "CO",
    name: "Colorado",
    electoralVotes: 10,
    partisanLean: -12,
    swingVolatility: 25,
    isBattleground: false,
    demographics: { white: 68, black: 4, hispanic: 22, asian: 3, other: 3 },
    composition: { urban: 35, suburban: 40, rural: 25 },
    educationSplit: { college: 44, nonCollege: 56 },
    issueSalience: {
      economy: 78, immigration: 58, abortion: 58, crime: 52, cultureWar: 48,
      labor: 52, energy: 65, healthcare: 62, education: 65, gunPolicy: 58
    },
    adCostMultiplier: 1.15,
    turnoutPotential: 72,
    region: "west",
    keyCity: "Denver",
    cx: 30, cy: 38
  },
  {
    id: "OR",
    name: "Oregon",
    electoralVotes: 8,
    partisanLean: -14,
    swingVolatility: 22,
    isBattleground: false,
    demographics: { white: 75, black: 2, hispanic: 14, asian: 5, other: 4 },
    composition: { urban: 32, suburban: 38, rural: 30 },
    educationSplit: { college: 36, nonCollege: 64 },
    issueSalience: {
      economy: 78, immigration: 48, abortion: 55, crime: 58, cultureWar: 50,
      labor: 62, energy: 68, healthcare: 68, education: 62, gunPolicy: 52
    },
    adCostMultiplier: 1.1,
    turnoutPotential: 70,
    region: "pacific",
    keyCity: "Portland",
    cx: 9, cy: 18
  },
  {
    id: "CT",
    name: "Connecticut",
    electoralVotes: 7,
    partisanLean: -18,
    swingVolatility: 15,
    isBattleground: false,
    demographics: { white: 66, black: 10, hispanic: 17, asian: 5, other: 2 },
    composition: { urban: 30, suburban: 52, rural: 18 },
    educationSplit: { college: 41, nonCollege: 59 },
    issueSalience: {
      economy: 80, immigration: 48, abortion: 52, crime: 50, cultureWar: 38,
      labor: 58, energy: 48, healthcare: 70, education: 72, gunPolicy: 60
    },
    adCostMultiplier: 1.9,
    turnoutPotential: 66,
    region: "northeast",
    keyCity: "Hartford",
    cx: 83, cy: 25
  },
  {
    id: "NM",
    name: "New Mexico",
    electoralVotes: 5,
    partisanLean: -10,
    swingVolatility: 28,
    isBattleground: false,
    demographics: { white: 37, black: 2, hispanic: 49, asian: 2, other: 10 },
    composition: { urban: 28, suburban: 30, rural: 42 },
    educationSplit: { college: 30, nonCollege: 70 },
    issueSalience: {
      economy: 82, immigration: 75, abortion: 52, crime: 55, cultureWar: 40,
      labor: 55, energy: 65, healthcare: 70, education: 65, gunPolicy: 48
    },
    adCostMultiplier: 0.7,
    turnoutPotential: 58,
    region: "southwest",
    keyCity: "Albuquerque",
    cx: 24, cy: 52
  },
  {
    id: "HI",
    name: "Hawaii",
    electoralVotes: 4,
    partisanLean: -30,
    swingVolatility: 10,
    isBattleground: false,
    demographics: { white: 25, black: 2, hispanic: 11, asian: 37, other: 25 },
    composition: { urban: 40, suburban: 35, rural: 25 },
    educationSplit: { college: 34, nonCollege: 66 },
    issueSalience: {
      economy: 80, immigration: 35, abortion: 45, crime: 40, cultureWar: 30,
      labor: 60, energy: 65, healthcare: 70, education: 60, gunPolicy: 40
    },
    adCostMultiplier: 1.2,
    turnoutPotential: 50,
    region: "pacific",
    keyCity: "Honolulu",
    cx: 18, cy: 82
  },
  {
    id: "RI",
    name: "Rhode Island",
    electoralVotes: 4,
    partisanLean: -22,
    swingVolatility: 15,
    isBattleground: false,
    demographics: { white: 72, black: 6, hispanic: 16, asian: 4, other: 2 },
    composition: { urban: 42, suburban: 40, rural: 18 },
    educationSplit: { college: 36, nonCollege: 64 },
    issueSalience: {
      economy: 82, immigration: 45, abortion: 50, crime: 48, cultureWar: 35,
      labor: 62, energy: 48, healthcare: 72, education: 65, gunPolicy: 55
    },
    adCostMultiplier: 1.3,
    turnoutPotential: 62,
    region: "northeast",
    keyCity: "Providence",
    cx: 85, cy: 24
  },
  {
    id: "DE",
    name: "Delaware",
    electoralVotes: 3,
    partisanLean: -14,
    swingVolatility: 18,
    isBattleground: false,
    demographics: { white: 62, black: 23, hispanic: 10, asian: 4, other: 1 },
    composition: { urban: 28, suburban: 48, rural: 24 },
    educationSplit: { college: 35, nonCollege: 65 },
    issueSalience: {
      economy: 80, immigration: 48, abortion: 52, crime: 55, cultureWar: 38,
      labor: 58, energy: 48, healthcare: 65, education: 62, gunPolicy: 52
    },
    adCostMultiplier: 1.5,
    turnoutPotential: 64,
    region: "northeast",
    keyCity: "Wilmington",
    cx: 79, cy: 36
  },
  {
    id: "VT",
    name: "Vermont",
    electoralVotes: 3,
    partisanLean: -32,
    swingVolatility: 12,
    isBattleground: false,
    demographics: { white: 93, black: 1, hispanic: 2, asian: 2, other: 2 },
    composition: { urban: 12, suburban: 28, rural: 60 },
    educationSplit: { college: 42, nonCollege: 58 },
    issueSalience: {
      economy: 75, immigration: 35, abortion: 48, crime: 30, cultureWar: 38,
      labor: 60, energy: 65, healthcare: 75, education: 68, gunPolicy: 52
    },
    adCostMultiplier: 0.7,
    turnoutPotential: 72,
    region: "northeast",
    keyCity: "Burlington",
    cx: 82, cy: 14
  },
  {
    id: "DC",
    name: "District of Columbia",
    electoralVotes: 3,
    partisanLean: -78,
    swingVolatility: 5,
    isBattleground: false,
    demographics: { white: 38, black: 45, hispanic: 11, asian: 4, other: 2 },
    composition: { urban: 100, suburban: 0, rural: 0 },
    educationSplit: { college: 60, nonCollege: 40 },
    issueSalience: {
      economy: 78, immigration: 45, abortion: 55, crime: 68, cultureWar: 50,
      labor: 55, energy: 48, healthcare: 70, education: 72, gunPolicy: 65
    },
    adCostMultiplier: 2.0,
    turnoutPotential: 62,
    region: "northeast",
    keyCity: "Washington",
    cx: 77, cy: 40
  },

  // ============================================================
  // LEAN / SOLID REPUBLICAN STATES
  // ============================================================
  {
    id: "TX",
    name: "Texas",
    electoralVotes: 40,
    partisanLean: 14,
    swingVolatility: 28,
    isBattleground: false,
    demographics: { white: 40, black: 12, hispanic: 40, asian: 5, other: 3 },
    composition: { urban: 40, suburban: 38, rural: 22 },
    educationSplit: { college: 32, nonCollege: 68 },
    issueSalience: {
      economy: 85, immigration: 90, abortion: 62, crime: 65, cultureWar: 58,
      labor: 55, energy: 85, healthcare: 62, education: 58, gunPolicy: 60
    },
    adCostMultiplier: 1.6,
    turnoutPotential: 58,
    region: "southwest",
    keyCity: "Houston",
    cx: 42, cy: 65
  },
  {
    id: "FL",
    name: "Florida",
    electoralVotes: 30,
    partisanLean: 16,
    swingVolatility: 30,
    isBattleground: false,
    demographics: { white: 53, black: 16, hispanic: 26, asian: 3, other: 2 },
    composition: { urban: 40, suburban: 42, rural: 18 },
    educationSplit: { college: 33, nonCollege: 67 },
    issueSalience: {
      economy: 85, immigration: 72, abortion: 58, crime: 62, cultureWar: 58,
      labor: 52, energy: 55, healthcare: 72, education: 62, gunPolicy: 58
    },
    adCostMultiplier: 1.7,
    turnoutPotential: 65,
    region: "southeast",
    keyCity: "Miami",
    cx: 76, cy: 68
  },
  {
    id: "OH",
    name: "Ohio",
    electoralVotes: 17,
    partisanLean: 14,
    swingVolatility: 30,
    isBattleground: false,
    demographics: { white: 78, black: 13, hispanic: 4, asian: 2, other: 3 },
    composition: { urban: 32, suburban: 38, rural: 30 },
    educationSplit: { college: 31, nonCollege: 69 },
    issueSalience: {
      economy: 88, immigration: 55, abortion: 62, crime: 58, cultureWar: 50,
      labor: 78, energy: 65, healthcare: 68, education: 58, gunPolicy: 52
    },
    adCostMultiplier: 1.1,
    turnoutPotential: 66,
    region: "midwest",
    keyCity: "Columbus",
    cx: 69, cy: 34
  },
  {
    id: "IN",
    name: "Indiana",
    electoralVotes: 11,
    partisanLean: 22,
    swingVolatility: 18,
    isBattleground: false,
    demographics: { white: 79, black: 10, hispanic: 7, asian: 2, other: 2 },
    composition: { urban: 30, suburban: 35, rural: 35 },
    educationSplit: { college: 29, nonCollege: 71 },
    issueSalience: {
      economy: 85, immigration: 55, abortion: 58, crime: 55, cultureWar: 52,
      labor: 68, energy: 58, healthcare: 62, education: 55, gunPolicy: 48
    },
    adCostMultiplier: 0.9,
    turnoutPotential: 60,
    region: "midwest",
    keyCity: "Indianapolis",
    cx: 64, cy: 36
  },
  {
    id: "TN",
    name: "Tennessee",
    electoralVotes: 11,
    partisanLean: 28,
    swingVolatility: 14,
    isBattleground: false,
    demographics: { white: 73, black: 17, hispanic: 6, asian: 2, other: 2 },
    composition: { urban: 30, suburban: 32, rural: 38 },
    educationSplit: { college: 30, nonCollege: 70 },
    issueSalience: {
      economy: 82, immigration: 55, abortion: 58, crime: 55, cultureWar: 58,
      labor: 52, energy: 52, healthcare: 60, education: 55, gunPolicy: 52
    },
    adCostMultiplier: 0.9,
    turnoutPotential: 58,
    region: "southeast",
    keyCity: "Nashville",
    cx: 64, cy: 48
  },
  {
    id: "MO",
    name: "Missouri",
    electoralVotes: 10,
    partisanLean: 22,
    swingVolatility: 18,
    isBattleground: false,
    demographics: { white: 79, black: 12, hispanic: 4, asian: 2, other: 3 },
    composition: { urban: 28, suburban: 32, rural: 40 },
    educationSplit: { college: 32, nonCollege: 68 },
    issueSalience: {
      economy: 84, immigration: 55, abortion: 60, crime: 60, cultureWar: 52,
      labor: 60, energy: 55, healthcare: 62, education: 58, gunPolicy: 55
    },
    adCostMultiplier: 0.95,
    turnoutPotential: 62,
    region: "midwest",
    keyCity: "Kansas City",
    cx: 50, cy: 40
  },
  {
    id: "SC",
    name: "South Carolina",
    electoralVotes: 9,
    partisanLean: 20,
    swingVolatility: 20,
    isBattleground: false,
    demographics: { white: 63, black: 27, hispanic: 6, asian: 2, other: 2 },
    composition: { urban: 25, suburban: 35, rural: 40 },
    educationSplit: { college: 30, nonCollege: 70 },
    issueSalience: {
      economy: 82, immigration: 58, abortion: 55, crime: 55, cultureWar: 55,
      labor: 48, energy: 50, healthcare: 62, education: 58, gunPolicy: 52
    },
    adCostMultiplier: 0.85,
    turnoutPotential: 60,
    region: "southeast",
    keyCity: "Charleston",
    cx: 74, cy: 52
  },
  {
    id: "AL",
    name: "Alabama",
    electoralVotes: 9,
    partisanLean: 30,
    swingVolatility: 12,
    isBattleground: false,
    demographics: { white: 65, black: 27, hispanic: 5, asian: 1, other: 2 },
    composition: { urban: 24, suburban: 28, rural: 48 },
    educationSplit: { college: 27, nonCollege: 73 },
    issueSalience: {
      economy: 82, immigration: 55, abortion: 55, crime: 55, cultureWar: 58,
      labor: 48, energy: 52, healthcare: 62, education: 55, gunPolicy: 48
    },
    adCostMultiplier: 0.7,
    turnoutPotential: 55,
    region: "southeast",
    keyCity: "Birmingham",
    cx: 62, cy: 55
  },
  {
    id: "LA",
    name: "Louisiana",
    electoralVotes: 8,
    partisanLean: 26,
    swingVolatility: 14,
    isBattleground: false,
    demographics: { white: 58, black: 33, hispanic: 6, asian: 2, other: 1 },
    composition: { urban: 28, suburban: 28, rural: 44 },
    educationSplit: { college: 26, nonCollege: 74 },
    issueSalience: {
      economy: 84, immigration: 55, abortion: 52, crime: 62, cultureWar: 52,
      labor: 52, energy: 72, healthcare: 65, education: 55, gunPolicy: 48
    },
    adCostMultiplier: 0.8,
    turnoutPotential: 55,
    region: "southeast",
    keyCity: "New Orleans",
    cx: 55, cy: 62
  },
  {
    id: "KY",
    name: "Kentucky",
    electoralVotes: 8,
    partisanLean: 30,
    swingVolatility: 12,
    isBattleground: false,
    demographics: { white: 84, black: 8, hispanic: 4, asian: 2, other: 2 },
    composition: { urban: 22, suburban: 30, rural: 48 },
    educationSplit: { college: 27, nonCollege: 73 },
    issueSalience: {
      economy: 85, immigration: 50, abortion: 55, crime: 50, cultureWar: 55,
      labor: 62, energy: 72, healthcare: 65, education: 58, gunPolicy: 50
    },
    adCostMultiplier: 0.8,
    turnoutPotential: 58,
    region: "southeast",
    keyCity: "Louisville",
    cx: 66, cy: 40
  },
  {
    id: "OK",
    name: "Oklahoma",
    electoralVotes: 7,
    partisanLean: 38,
    swingVolatility: 8,
    isBattleground: false,
    demographics: { white: 65, black: 7, hispanic: 12, asian: 2, other: 14 },
    composition: { urban: 25, suburban: 30, rural: 45 },
    educationSplit: { college: 28, nonCollege: 72 },
    issueSalience: {
      economy: 82, immigration: 62, abortion: 52, crime: 50, cultureWar: 55,
      labor: 48, energy: 78, healthcare: 58, education: 55, gunPolicy: 48
    },
    adCostMultiplier: 0.7,
    turnoutPotential: 55,
    region: "southwest",
    keyCity: "Oklahoma City",
    cx: 44, cy: 50
  },
  {
    id: "IA",
    name: "Iowa",
    electoralVotes: 6,
    partisanLean: 18,
    swingVolatility: 25,
    isBattleground: false,
    demographics: { white: 85, black: 4, hispanic: 6, asian: 3, other: 2 },
    composition: { urban: 22, suburban: 28, rural: 50 },
    educationSplit: { college: 31, nonCollege: 69 },
    issueSalience: {
      economy: 85, immigration: 55, abortion: 55, crime: 42, cultureWar: 48,
      labor: 68, energy: 62, healthcare: 65, education: 62, gunPolicy: 45
    },
    adCostMultiplier: 0.8,
    turnoutPotential: 70,
    region: "midwest",
    keyCity: "Des Moines",
    cx: 51, cy: 30
  },
  {
    id: "KS",
    name: "Kansas",
    electoralVotes: 6,
    partisanLean: 24,
    swingVolatility: 15,
    isBattleground: false,
    demographics: { white: 76, black: 6, hispanic: 12, asian: 3, other: 3 },
    composition: { urban: 24, suburban: 30, rural: 46 },
    educationSplit: { college: 35, nonCollege: 65 },
    issueSalience: {
      economy: 82, immigration: 55, abortion: 62, crime: 48, cultureWar: 50,
      labor: 50, energy: 60, healthcare: 60, education: 60, gunPolicy: 48
    },
    adCostMultiplier: 0.75,
    turnoutPotential: 62,
    region: "midwest",
    keyCity: "Wichita",
    cx: 44, cy: 42
  },
  {
    id: "UT",
    name: "Utah",
    electoralVotes: 6,
    partisanLean: 26,
    swingVolatility: 20,
    isBattleground: false,
    demographics: { white: 78, black: 1, hispanic: 15, asian: 3, other: 3 },
    composition: { urban: 30, suburban: 42, rural: 28 },
    educationSplit: { college: 36, nonCollege: 64 },
    issueSalience: {
      economy: 80, immigration: 55, abortion: 48, crime: 42, cultureWar: 52,
      labor: 42, energy: 60, healthcare: 58, education: 62, gunPolicy: 42
    },
    adCostMultiplier: 0.8,
    turnoutPotential: 65,
    region: "west",
    keyCity: "Salt Lake City",
    cx: 21, cy: 38
  },
  {
    id: "AR",
    name: "Arkansas",
    electoralVotes: 6,
    partisanLean: 32,
    swingVolatility: 10,
    isBattleground: false,
    demographics: { white: 72, black: 16, hispanic: 8, asian: 2, other: 2 },
    composition: { urban: 20, suburban: 25, rural: 55 },
    educationSplit: { college: 25, nonCollege: 75 },
    issueSalience: {
      economy: 82, immigration: 52, abortion: 52, crime: 48, cultureWar: 55,
      labor: 50, energy: 55, healthcare: 62, education: 55, gunPolicy: 48
    },
    adCostMultiplier: 0.6,
    turnoutPotential: 52,
    region: "southeast",
    keyCity: "Little Rock",
    cx: 52, cy: 52
  },
  {
    id: "MS",
    name: "Mississippi",
    electoralVotes: 6,
    partisanLean: 28,
    swingVolatility: 12,
    isBattleground: false,
    demographics: { white: 56, black: 38, hispanic: 3, asian: 1, other: 2 },
    composition: { urban: 18, suburban: 22, rural: 60 },
    educationSplit: { college: 23, nonCollege: 77 },
    issueSalience: {
      economy: 85, immigration: 48, abortion: 50, crime: 55, cultureWar: 52,
      labor: 48, energy: 52, healthcare: 68, education: 58, gunPolicy: 45
    },
    adCostMultiplier: 0.55,
    turnoutPotential: 52,
    region: "southeast",
    keyCity: "Jackson",
    cx: 58, cy: 58
  },
  {
    id: "NE",
    name: "Nebraska",
    electoralVotes: 5,
    partisanLean: 26,
    swingVolatility: 18,
    isBattleground: false,
    demographics: { white: 79, black: 5, hispanic: 11, asian: 3, other: 2 },
    composition: { urban: 24, suburban: 28, rural: 48 },
    educationSplit: { college: 34, nonCollege: 66 },
    issueSalience: {
      economy: 82, immigration: 55, abortion: 52, crime: 45, cultureWar: 48,
      labor: 55, energy: 60, healthcare: 58, education: 58, gunPolicy: 45
    },
    adCostMultiplier: 0.7,
    turnoutPotential: 65,
    region: "midwest",
    keyCity: "Omaha",
    cx: 44, cy: 32
  },
  {
    id: "WV",
    name: "West Virginia",
    electoralVotes: 4,
    partisanLean: 42,
    swingVolatility: 8,
    isBattleground: false,
    demographics: { white: 92, black: 4, hispanic: 2, asian: 1, other: 1 },
    composition: { urban: 12, suburban: 22, rural: 66 },
    educationSplit: { college: 22, nonCollege: 78 },
    issueSalience: {
      economy: 88, immigration: 48, abortion: 48, crime: 42, cultureWar: 55,
      labor: 68, energy: 82, healthcare: 68, education: 52, gunPolicy: 48
    },
    adCostMultiplier: 0.55,
    turnoutPotential: 52,
    region: "southeast",
    keyCity: "Charleston",
    cx: 72, cy: 40
  },
  {
    id: "ID",
    name: "Idaho",
    electoralVotes: 4,
    partisanLean: 38,
    swingVolatility: 8,
    isBattleground: false,
    demographics: { white: 82, black: 1, hispanic: 13, asian: 2, other: 2 },
    composition: { urban: 18, suburban: 30, rural: 52 },
    educationSplit: { college: 30, nonCollege: 70 },
    issueSalience: {
      economy: 78, immigration: 58, abortion: 48, crime: 40, cultureWar: 55,
      labor: 45, energy: 58, healthcare: 55, education: 55, gunPolicy: 48
    },
    adCostMultiplier: 0.6,
    turnoutPotential: 62,
    region: "west",
    keyCity: "Boise",
    cx: 17, cy: 24
  },
  {
    id: "MT",
    name: "Montana",
    electoralVotes: 4,
    partisanLean: 28,
    swingVolatility: 15,
    isBattleground: false,
    demographics: { white: 86, black: 1, hispanic: 4, asian: 1, other: 8 },
    composition: { urban: 14, suburban: 22, rural: 64 },
    educationSplit: { college: 34, nonCollege: 66 },
    issueSalience: {
      economy: 78, immigration: 48, abortion: 48, crime: 35, cultureWar: 48,
      labor: 52, energy: 62, healthcare: 58, education: 52, gunPolicy: 50
    },
    adCostMultiplier: 0.55,
    turnoutPotential: 65,
    region: "west",
    keyCity: "Billings",
    cx: 26, cy: 14
  },
  {
    id: "AK",
    name: "Alaska",
    electoralVotes: 3,
    partisanLean: 20,
    swingVolatility: 22,
    isBattleground: false,
    demographics: { white: 62, black: 3, hispanic: 7, asian: 6, other: 22 },
    composition: { urban: 20, suburban: 18, rural: 62 },
    educationSplit: { college: 30, nonCollege: 70 },
    issueSalience: {
      economy: 80, immigration: 42, abortion: 42, crime: 38, cultureWar: 45,
      labor: 55, energy: 82, healthcare: 58, education: 50, gunPolicy: 52
    },
    adCostMultiplier: 0.8,
    turnoutPotential: 58,
    region: "pacific",
    keyCity: "Anchorage",
    cx: 8, cy: 82
  },
  {
    id: "SD",
    name: "South Dakota",
    electoralVotes: 3,
    partisanLean: 32,
    swingVolatility: 10,
    isBattleground: false,
    demographics: { white: 82, black: 2, hispanic: 4, asian: 2, other: 10 },
    composition: { urban: 15, suburban: 22, rural: 63 },
    educationSplit: { college: 31, nonCollege: 69 },
    issueSalience: {
      economy: 80, immigration: 48, abortion: 48, crime: 35, cultureWar: 48,
      labor: 50, energy: 58, healthcare: 58, education: 55, gunPolicy: 42
    },
    adCostMultiplier: 0.5,
    turnoutPotential: 62,
    region: "midwest",
    keyCity: "Sioux Falls",
    cx: 42, cy: 22
  },
  {
    id: "ND",
    name: "North Dakota",
    electoralVotes: 3,
    partisanLean: 36,
    swingVolatility: 8,
    isBattleground: false,
    demographics: { white: 84, black: 3, hispanic: 4, asian: 2, other: 7 },
    composition: { urban: 14, suburban: 20, rural: 66 },
    educationSplit: { college: 32, nonCollege: 68 },
    issueSalience: {
      economy: 80, immigration: 45, abortion: 45, crime: 32, cultureWar: 48,
      labor: 52, energy: 72, healthcare: 55, education: 52, gunPolicy: 42
    },
    adCostMultiplier: 0.5,
    turnoutPotential: 62,
    region: "midwest",
    keyCity: "Fargo",
    cx: 42, cy: 14
  },
  {
    id: "WY",
    name: "Wyoming",
    electoralVotes: 3,
    partisanLean: 48,
    swingVolatility: 5,
    isBattleground: false,
    demographics: { white: 84, black: 1, hispanic: 10, asian: 1, other: 4 },
    composition: { urban: 10, suburban: 18, rural: 72 },
    educationSplit: { college: 28, nonCollege: 72 },
    issueSalience: {
      economy: 78, immigration: 50, abortion: 42, crime: 30, cultureWar: 50,
      labor: 45, energy: 82, healthcare: 52, education: 48, gunPolicy: 50
    },
    adCostMultiplier: 0.45,
    turnoutPotential: 60,
    region: "west",
    keyCity: "Cheyenne",
    cx: 30, cy: 28
  }
];
