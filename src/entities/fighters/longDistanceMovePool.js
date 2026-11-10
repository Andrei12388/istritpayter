import { FighterState } from '../../constants/fighter.js';

const GENERIC_LONG_DISTANCE_MOVES = [
  FighterState.HEADBUTT,
  FighterState.SPECIAL_1,
  FighterState.SPECIAL_2,
  FighterState.SPECIAL_2_ROCKRELEASE,
  FighterState.TORNADO_DIG,
  FighterState.KNEEDASH,
  FighterState.HEADBUTT_DOWN,
];

const CHARACTER_LONG_DISTANCE_MOVES = {
  malupiton: [
    FighterState.SPECIAL_MOVE_3,
    FighterState.SPECIAL_MOVE_5,
  ],
  golem: [
    FighterState.SPECIAL_2_ROCKRELEASE,
    FighterState.KNEEDASH,
    FighterState.TORNADO_DIG,
  ],
  mamaoni: [
    FighterState.SPECIAL_MOVE_1,
  ],
};

const CHARACTER_COMBO_SETS = {
  malupiton: [
    [
      { state: FighterState.LIGHT_PUNCH, duration: 340 },
      { state: FighterState.LIGHT_PUNCH, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 220 },
    ],
    [
      { state: FighterState.CROUCH_LIGHTKICK, duration: 340 },
      { state: FighterState.CROUCH_LIGHTKICK, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 220 },
    ],
    [
      { state: FighterState.SPECIAL_MOVE_1, duration: 340 },
      { state: FighterState.SPECIAL_MOVE_2, duration: 340 },
      { state: FighterState.SPECIAL_MOVE_3, duration: 220 },
    ],
    [
      { state: FighterState.SPECIAL_MOVE_1, duration: 340 },
      { state: FighterState.SPECIAL_MOVE_2, duration: 340 },
      { state: FighterState.SPECIAL_MOVE_5, duration: 220 },
    ],
     [
      { state: FighterState.SPECIAL_MOVE_1, duration: 340 },
      { state: FighterState.SPECIAL_MOVE_2, duration: 340 },
      { state: FighterState.HYPERSKILL_1, duration: 220 },
    ],
  ],
  golem: [
    [
      { state: FighterState.CROUCH_LIGHTKICK, duration: 340 },
      { state: FighterState.CROUCH_LIGHTKICK, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 220 },
      { state: FighterState.KNEEDASH, duration: 250 },
      { state: FighterState.TORNADO_DIG, duration: 360 },
    ],
    [
      { state: FighterState.CROUCH_LIGHTKICK, duration: 340 },
      { state: FighterState.CROUCH_LIGHTKICK, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 220 },
    ],
    [
      { state: FighterState.LIGHT_PUNCH, duration: 340 },
      { state: FighterState.LIGHT_PUNCH, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 220 },
    ],
    [
      { state: FighterState.LIGHT_PUNCH, duration: 340 },
      { state: FighterState.LIGHT_PUNCH, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 220 },
      { state: FighterState.KNEEDASH, duration: 250 },
      { state: FighterState.TORNADO_DIG, duration: 360 },
    ],
  ],
  mamaoni: [
    [
      { state: FighterState.HEAVY_PUNCH, duration: 340 },
      { state: FighterState.SPECIAL_MOVE_1, duration: 340 },
    ],
     [
      { state: FighterState.LIGHT_PUNCH, duration: 340 },
      { state: FighterState.LIGHT_PUNCH, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 220 },
    ],
    [
      { state: FighterState.SPECIAL_MOVE_2, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 340 },
    ],
    [
      { state: FighterState.SPECIAL_MOVE_2, duration: 340 },
      { state: FighterState.HEAVY_PUNCH, duration: 340 },
      { state: FighterState.SPECIAL_MOVE_1, duration: 340 },
    ],
  ],
};

function normalizeFighterName(fighter) {
  const rawName = fighter?.id ?? fighter?.constructor?.name ?? fighter?.name ?? '';
  return String(rawName).toLowerCase();
}

export function getCharacterLongDistanceMovePool(fighter) {
  const name = normalizeFighterName(fighter);

  if (name.includes('golem')) return [...CHARACTER_LONG_DISTANCE_MOVES.golem];
  if (name.includes('malupiton')) return [...CHARACTER_LONG_DISTANCE_MOVES.malupiton];
  if (name.includes('mamaoni')) return [...CHARACTER_LONG_DISTANCE_MOVES.mamaoni];

  return [...GENERIC_LONG_DISTANCE_MOVES];
}

export function getCharacterComboSet(fighter, randomFn = Math.random) {
  const name = normalizeFighterName(fighter);
  const sets =
    name.includes('golem')
      ? CHARACTER_COMBO_SETS.golem
      : name.includes('malupiton')
        ? CHARACTER_COMBO_SETS.malupiton
        : name.includes('mamaoni')
          ? CHARACTER_COMBO_SETS.mamaoni
          : [];

  if (!sets.length) return [];
  return [...sets[Math.floor(randomFn() * sets.length)]];
}

export function getRandomLongDistanceMove(fighter, randomFn = Math.random) {
  const pool = getCharacterLongDistanceMovePool(fighter);
  return pool[Math.floor(randomFn() * pool.length)];
}
