import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

const MODES = {
  addSub20: {
    id: 'addSub20',
    name: '➕➖ Easy Math',
    description: '⭐',
    inputType: 'grid',
    maxDigits: 2,
  },
  doubleDigit: {
    id: 'doubleDigit',
    name: '➕➖ Big Numbers',
    description: '⭐⭐',
    inputType: 'numpad',
    maxDigits: 3,
  },
  multFacts: {
    id: 'multFacts',
    name: '✖️ Times Tables',
    description: '⭐⭐⭐',
    inputType: 'numpad',
    maxDigits: 3,
  },
  mentalMult: {
    id: 'mentalMult',
    name: '🧠 Mental Multiplication',
    description: '⭐⭐⭐⭐',
    inputType: 'numpad',
    maxDigits: 4,
  },
};

const PROBLEMS_PER_WAVE = 9;
const BOUNCE_SPEED = 0.02;
const PERFECT_TIME = 2000;
const PAUSE_BETWEEN = 500;

const FRUITS = [
  { name: 'apple', color: '#ef4444', emoji: '🍎' },
  { name: 'orange', color: '#f97316', emoji: '🍊' },
  { name: 'watermelon', color: '#22c55e', emoji: '🍉' },
  { name: 'grape', color: '#a855f7', emoji: '🍇' },
  { name: 'banana', color: '#eab308', emoji: '🍌' },
  { name: 'strawberry', color: '#ec4899', emoji: '🍓' },
];

const SHOP_ITEMS = {
  // Necessities
  food_bowl: { name: 'Food Bowl', cost: 50, category: 'necessities', effect: 'Feed your puppy!', icon: '🥣', img: '/assets/food-bowl.png', oneTime: true },
  water_bowl: { name: 'Water Bowl', cost: 50, category: 'necessities', effect: 'Give your puppy water!', icon: '🥤', img: '/assets/water-bowl.png', oneTime: true },
  bed: { name: 'Bed', cost: 80, category: 'necessities', effect: 'Puppy stays happy longer!', icon: '🛏️', img: '/assets/bed.png', oneTime: true },

  // Upgrades
  premium_food_bowl: { name: 'Fancy Food Bowl', cost: 150, category: 'upgrades', effect: 'Better food for puppy!', icon: '🍽️', oneTime: true, requires: 'food_bowl' },
  premium_water_bowl: { name: 'Fancy Water Bowl', cost: 150, category: 'upgrades', effect: 'Better water for puppy!', icon: '🏺', oneTime: true, requires: 'water_bowl' },
  cozy_bed: { name: 'Cozy Bed', cost: 200, category: 'upgrades', effect: 'Super comfy! 🐶😴', icon: '🛋️', oneTime: true, requires: 'bed' },
  treat_bag: { name: 'Treat Bag', cost: 120, category: 'upgrades', effect: 'Give treats! 🦴', icon: '🎒', img: '/assets/treat-bag.png', oneTime: true },
  toy_ball: { name: 'Toy Ball', cost: 100, category: 'upgrades', effect: 'Puppy loves to play! 😊', icon: '⚾', img: '/assets/toy-ball.png', oneTime: true },
  chew_rope: { name: 'Chew Rope', cost: 100, category: 'upgrades', effect: 'More fun for puppy! 😊', icon: '🪢', img: '/assets/chew-rope.png', oneTime: true },

  // Consumables
  basic_kibble: { name: 'Kibble', cost: 20, category: 'consumables', effect: '🍖 → 🐶😋', icon: '🍖', oneTime: false, requires: 'food_bowl', stat: 'hunger', amount: 30 },
  premium_kibble: { name: 'Yummy Kibble', cost: 35, category: 'consumables', effect: '🥩 → 🐶🤤', icon: '🥩', oneTime: false, requires: 'premium_food_bowl', stat: 'hunger', amount: 50 },
  water: { name: 'Water', cost: 15, category: 'consumables', effect: '💧 → 🐶😊', icon: '💧', oneTime: false, requires: 'water_bowl', stat: 'thirst', amount: 30 },
  spring_water: { name: 'Spring Water', cost: 25, category: 'consumables', effect: '🫗 → 🐶😍', icon: '🫗', oneTime: false, requires: 'premium_water_bowl', stat: 'thirst', amount: 50 },
  treat: { name: 'Treat', cost: 10, category: 'consumables', effect: '🦴 → 🐶💕', icon: '🦴', oneTime: false, requires: 'treat_bag', stat: 'treat', hungerAmt: 15, happyAmt: 5 },

  // Room Themes
  painted_house: { name: 'Pretty House', cost: 400, category: 'upgrades', effect: 'New room! 🏠', icon: '🏠', oneTime: true, happinessBoost: 15, roomTheme: 'painted' },
  ninja_dojo: { name: 'Ninja Dojo', cost: 800, category: 'upgrades', effect: 'Ninja home! ⛩️', icon: '⛩️', img: '/assets/ninja-dojo.png', oneTime: true, happinessBoost: 25, roomTheme: 'dojo' },
};

// ============================================================================
// ROOM DECORATION ITEMS
// ============================================================================

const WALL_PAINTS = {
  warm_beige: { name: 'Warm Beige', cost: 30, color: '#d4b896', icon: '🟤' },
  sky_blue: { name: 'Sky Blue', cost: 35, color: '#87ceeb', icon: '🔵' },
  mint_green: { name: 'Mint Green', cost: 35, color: '#98d4a8', icon: '🟢' },
  sunset_orange: { name: 'Sunset Orange', cost: 40, color: '#f4a460', icon: '🟠' },
  lavender: { name: 'Lavender', cost: 40, color: '#c4a8d8', icon: '🟣' },
};

const WALLPAPERS = {
  star_pattern: { name: 'Star Wallpaper', cost: 80, pattern: 'stars', icon: '⭐' },
  stripe_pattern: { name: 'Stripe Wallpaper', cost: 90, pattern: 'stripes', icon: '📏' },
  ninja_pattern: { name: 'Ninja Wallpaper', cost: 150, pattern: 'ninja', icon: '🥷' },
};

const FLOOR_OPTIONS = {
  wood_floor: { name: 'Wood Floor', cost: 60, color: '#a0785a', icon: '🪵' },
  carpet_floor: { name: 'Soft Carpet', cost: 80, color: '#7ea8c4', icon: '🟦' },
  checkered_floor: { name: 'Checkered Tile', cost: 100, color: '#ddd', pattern: 'checkered', icon: '⬜' },
  tatami_floor: { name: 'Tatami Mats', cost: 120, color: '#c4b78c', pattern: 'tatami', icon: '🟫' },
};

const ROOM_ITEMS = {
  // --- Furniture (FLOOR zones) ---
  small_rug: { name: 'Small Rug', cost: 60, category: 'furniture', zone: 'FLOOR-C', happinessBoost: 3, icon: '🟫', img: '/assets/small-rug.png', replaces: null },
  large_rug: { name: 'Large Rug', cost: 120, category: 'furniture', zone: 'FLOOR-C', happinessBoost: 6, icon: '🟥', img: '/assets/large-rug.png', replaces: 'small_rug' },
  bean_bag: { name: 'Bean Bag', cost: 100, category: 'furniture', zone: 'FLOOR-L', happinessBoost: 5, icon: '🫘', img: '/assets/bean-bag.png' },
  armchair: { name: 'Armchair', cost: 180, category: 'furniture', zone: 'FLOOR-L', happinessBoost: 8, icon: '🪑', img: '/assets/armchair.png', replaces: 'bean_bag' },
  couch: { name: 'Couch', cost: 300, category: 'furniture', zone: 'FLOOR-L', happinessBoost: 12, icon: '🛋️', replaces: 'armchair' },
  bookshelf: { name: 'Bookshelf', cost: 150, category: 'furniture', zone: 'FLOOR-L', happinessBoost: 7, icon: '📚', img: '/assets/bookshelf.png' },
  side_table: { name: 'Side Table', cost: 80, category: 'furniture', zone: 'FLOOR-R', happinessBoost: 4, icon: '🪑', img: '/assets/side-table.png' },
  lamp: { name: 'Lamp', cost: 100, category: 'furniture', zone: 'FLOOR-R', happinessBoost: 5, icon: '💡', img: '/assets/lamp.png', requires: 'side_table' },
  toy_basket: { name: 'Toy Basket', cost: 80, category: 'furniture', zone: 'FRONT-R', happinessBoost: 4, icon: '🧺', img: '/assets/toy-basket.png' },

  // --- Wall Decor ---
  paw_poster: { name: 'Paw Poster', cost: 60, category: 'wall_decor', zone: 'WALL-L', happinessBoost: 3, icon: '🐾', img: '/assets/paw-poster.png' },
  space_poster: { name: 'Space Poster', cost: 80, category: 'wall_decor', zone: 'WALL-R', happinessBoost: 4, icon: '🚀', img: '/assets/space-poster.png' },
  ninja_poster: { name: 'Ninja Poster', cost: 100, category: 'wall_decor', zone: 'WALL-L', happinessBoost: 5, icon: '🥋', img: '/assets/ninja-poster.png' },
  clock: { name: 'Clock', cost: 70, category: 'wall_decor', zone: 'WALL-R', happinessBoost: 3, icon: '🕐' },
  small_shelf: { name: 'Wall Shelf', cost: 90, category: 'wall_decor', zone: 'WALL-R', happinessBoost: 4, icon: '📦', img: '/assets/small-shelf.png' },
  picture_frame: { name: 'Picture Frame', cost: 60, category: 'wall_decor', zone: 'WALL-R', happinessBoost: 3, icon: '🖼️', img: '/assets/picture-frame.png' },
  fairy_lights: { name: 'Fairy Lights', cost: 120, category: 'wall_decor', zone: 'CEILING', happinessBoost: 6, icon: '✨', img: '/assets/fairy-lights.png' },
  hanging_plant: { name: 'Hanging Plant', cost: 80, category: 'wall_decor', zone: 'CEILING', happinessBoost: 4, icon: '🪴', img: '/assets/hanging-plant.png' },
  banner: { name: 'Banner', cost: 70, category: 'wall_decor', zone: 'CEILING', happinessBoost: 3, icon: '🎏' },

  // --- Electronics & Fun ---
  radio: { name: 'Radio', cost: 100, category: 'electronics', zone: 'FLOOR-R', happinessBoost: 5, icon: '📻', img: '/assets/radio.png' },
  tv: { name: 'TV', cost: 250, category: 'electronics', zone: 'WALL-C', happinessBoost: 10, icon: '📺', img: '/assets/tv.png' },
  gaming_console: { name: 'Gaming Console', cost: 200, category: 'electronics', zone: 'WALL-C', happinessBoost: 8, icon: '🎮', img: '/assets/gaming-console.png', requires: 'tv' },
  lava_lamp: { name: 'Lava Lamp', cost: 120, category: 'electronics', zone: 'FLOOR-R', happinessBoost: 6, icon: '🫧', img: '/assets/lava-lamp.png' },
  disco_ball: { name: 'Disco Ball', cost: 180, category: 'electronics', zone: 'CEILING', happinessBoost: 8, icon: '🪩', img: '/assets/disco-ball.png' },
  fish_tank: { name: 'Fish Tank', cost: 200, category: 'electronics', zone: 'FLOOR-L', happinessBoost: 10, icon: '🐠', img: '/assets/fish-tank.png' },

  // --- Premium / Aspirational ---
  ball_pit: { name: 'Ball Pit', cost: 400, category: 'premium', zone: 'FLOOR-C', happinessBoost: 15, icon: '🔴', img: '/assets/ball-pit.png' },
  tiny_trampoline: { name: 'Trampoline', cost: 350, category: 'premium', zone: 'FLOOR-R', happinessBoost: 12, icon: '🤸', img: '/assets/tiny-trampoline.png' },
  skateboard_ramp: { name: 'Skate Ramp', cost: 300, category: 'premium', zone: 'FLOOR-L', happinessBoost: 12, icon: '🛹', img: '/assets/skateboard-ramp.png' },
  ninja_dummy: { name: 'Ninja Dummy', cost: 350, category: 'premium', zone: 'FLOOR-L', happinessBoost: 12, icon: '🥊' },
  rocket_toy: { name: 'Rocket Ship', cost: 400, category: 'premium', zone: 'FLOOR-R', happinessBoost: 15, icon: '🚀' },
  ninja_dojo_makeover: { name: 'Ninja Dojo!', cost: 800, category: 'premium', zone: 'FULL', happinessBoost: 25, icon: '⛩️', img: '/assets/ninja-dojo.png' },
};

// Default positions for all draggable items in SVG viewBox coordinates (0-400 x, 0-300 y)
const DEFAULT_ITEM_POSITIONS = {
  // Ceiling
  fairy_lights:    { x: -10,  y: -60, w: 420, h: 100 },
  hanging_plant:   { x: 35,   y: -30, w: 155, h: 100 },
  banner:          { x: 130,  y: 0,   w: 140, h: 30 },
  disco_ball:      { x: 158,  y: -20, w: 90,  h: 82 },
  // Wall-L
  paw_poster:      { x: 10,   y: 35,  w: 95,  h: 95 },
  ninja_poster:    { x: 10,   y: 35,  w: 95,  h: 95 },
  // Wall-C
  tv:              { x: 120,  y: 10,  w: 165, h: 148 },
  gaming_console:  { x: 155,  y: 105, w: 90,  h: 85 },
  // Wall-R
  space_poster:    { x: 300,  y: 35,  w: 95,  h: 95 },
  clock:           { x: 322,  y: 72,  w: 36,  h: 36 },
  picture_frame:   { x: 305,  y: 95,  w: 70,  h: 70 },
  small_shelf:     { x: 288,  y: 135, w: 105, h: 80 },
  // Floor-L
  bean_bag:        { x: 10,   y: 195, w: 105, h: 85 },
  armchair:        { x: 10,   y: 190, w: 110, h: 90 },
  couch:           { x: 20,   y: 210, w: 100, h: 60 },
  bookshelf:       { x: -8,   y: 55,  w: 110, h: 170 },
  fish_tank:       { x: 10,   y: 185, w: 90,  h: 85 },
  skateboard_ramp: { x: 5,    y: 195, w: 115, h: 82 },
  ninja_dummy:     { x: 70,   y: 220, w: 50,  h: 60 },
  // Floor-C
  small_rug:       { x: 130,  y: 200, w: 145, h: 95 },
  large_rug:       { x: 105,  y: 190, w: 195, h: 120 },
  ball_pit:        { x: 135,  y: 205, w: 130, h: 85 },
  // Floor-R
  side_table:      { x: 288,  y: 160, w: 100, h: 115 },
  lamp:            { x: 298,  y: 130, w: 68,  h: 82 },
  radio:           { x: 300,  y: 218, w: 55,  h: 55 },
  lava_lamp:       { x: 342,  y: 178, w: 60,  h: 85 },
  tiny_trampoline: { x: 293,  y: 218, w: 88,  h: 62 },
  rocket_toy:      { x: 362,  y: 207, w: 30,  h: 60 },
  // Front-L
  food_bowl:       { x: 5,    y: 232, w: 70,  h: 70 },
  water_bowl:      { x: 60,   y: 235, w: 65,  h: 65 },
  // Front-R
  toy_basket:      { x: 290,  y: 218, w: 95,  h: 80 },
  bed:             { x: 238,  y: 225, w: 88,  h: 72 },
  toy_ball:        { x: 130,  y: 255, w: 48,  h: 46 },
  chew_rope:       { x: 208,  y: 248, w: 75,  h: 55 },
  // Puppy
  puppy:           { x: 200,  y: 235, w: 100, h: 100 },
};

function getItemPos(id, saved) {
  if (saved && saved[id]) return saved[id];
  const def = DEFAULT_ITEM_POSITIONS[id];
  return def ? { x: def.x, y: def.y } : { x: 200, y: 200 };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

const DEFAULT_STATE = {
  coins: 0,
  pet: {
    hunger: 80,
    thirst: 80,
    happiness: 80,
    purchasedItems: [],
    roomTheme: 'default',
  },
  room: {
    purchasedItems: [],
    wallPaint: null,
    wallpaper: null,
    flooring: null,
    itemPositions: {},
  },
  progress: {
    addSub20: { currentWave: 1, highScore: 0, bestStreak: 0 },
    doubleDigit: { currentWave: 1, highScore: 0, bestStreak: 0 },
    multFacts: { currentWave: 1, highScore: 0, bestStreak: 0 },
    mentalMult: { currentWave: 1, highScore: 0, bestStreak: 0 },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function loadState() {
  try {
    const saved = localStorage.getItem('mathNinjaState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        pet: { ...DEFAULT_STATE.pet, ...parsed.pet },
        room: { ...DEFAULT_STATE.room, ...(parsed.room || {}), itemPositions: { ...(parsed.room?.itemPositions || {}) } },
        progress: { ...DEFAULT_STATE.progress, ...parsed.progress },
      };
    }
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_STATE };
}

function saveState(state) {
  try {
    localStorage.setItem('mathNinjaState', JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFruit() {
  return FRUITS[Math.floor(Math.random() * FRUITS.length)];
}

// ============================================================================
// PROBLEM GENERATION
// ============================================================================

let lastProblem = null;

function generateProblem(mode, wave) {
  let problem;
  let attempts = 0;
  do {
    problem = generateProblemInner(mode, wave);
    attempts++;
  } while (
    attempts < 20 &&
    lastProblem &&
    lastProblem.num1 === problem.num1 &&
    lastProblem.num2 === problem.num2 &&
    lastProblem.operator === problem.operator
  );
  lastProblem = problem;
  return problem;
}

function generateProblemInner(mode, wave) {
  switch (mode) {
    case 'addSub20': return genAddSub20(wave);
    case 'doubleDigit': return genDoubleDigit(wave);
    case 'multFacts': return genMultFacts(wave);
    case 'mentalMult': return genMentalMult(wave);
    default: return genAddSub20(wave);
  }
}

function genAddSub20(wave) {
  if (wave === 1) {
    const a = randInt(1, 5), b = randInt(1, 10 - a);
    return { num1: a, num2: b, operator: '+', correctAnswer: a + b };
  } else if (wave === 2) {
    const a = randInt(3, 10), b = randInt(1, a);
    return { num1: a, num2: b, operator: '−', correctAnswer: a - b };
  } else if (wave === 3) {
    if (Math.random() < 0.5) {
      const a = randInt(1, 5), b = randInt(1, 10 - a);
      return { num1: a, num2: b, operator: '+', correctAnswer: a + b };
    } else {
      const a = randInt(3, 10), b = randInt(1, a);
      return { num1: a, num2: b, operator: '−', correctAnswer: a - b };
    }
  } else if (wave === 4) {
    const a = randInt(3, 12), b = randInt(Math.max(1, 11 - a), Math.min(12, 20 - a));
    return { num1: a, num2: b, operator: '+', correctAnswer: a + b };
  } else if (wave === 5) {
    const ans = randInt(11, 20), b = randInt(3, Math.min(ans, 12));
    return { num1: ans, num2: b, operator: '−', correctAnswer: ans - b };
  } else {
    if (Math.random() < 0.5) {
      const a = randInt(1, 12), b = randInt(1, 20 - a);
      return { num1: a, num2: b, operator: '+', correctAnswer: a + b };
    } else {
      const a = randInt(2, 20), b = randInt(1, a);
      return { num1: a, num2: b, operator: '−', correctAnswer: a - b };
    }
  }
}

function genDoubleDigit(wave) {
  if (wave === 1) {
    const a = randInt(11, 89), b = randInt(1, 9 - (a % 10 > 0 ? 0 : 0));
    const b2 = randInt(1, 9 - (a % 10));
    return { num1: a, num2: Math.max(1, b2), operator: '+', correctAnswer: a + Math.max(1, b2) };
  } else if (wave === 2) {
    const a = randInt(12, 99), b = randInt(1, Math.min(a % 10, 9));
    return { num1: a, num2: Math.max(1, b), operator: '−', correctAnswer: a - Math.max(1, b) };
  } else if (wave === 3) {
    const a = randInt(11, 89);
    const maxB = Math.min(9, 99 - a);
    const b = randInt(10 - (a % 10), maxB);
    return { num1: a, num2: Math.max(1, b), operator: '+', correctAnswer: a + Math.max(1, b) };
  } else if (wave === 4) {
    const a = randInt(20, 91);
    const b = randInt((a % 10) + 1, 9);
    return { num1: a, num2: Math.min(b, 9), operator: '−', correctAnswer: a - Math.min(b, 9) };
  } else if (wave === 5) {
    const a = randInt(11, 59), b = randInt(10, 99 - a);
    const tensOk = (a % 10) + (b % 10) < 10;
    if (tensOk) return { num1: a, num2: b, operator: '+', correctAnswer: a + b };
    return { num1: randInt(21, 45), num2: randInt(11, 43), operator: '+', correctAnswer: 0 };
  } else if (wave === 6) {
    const b = randInt(10, 49), a = randInt(b + 10, 99);
    return { num1: a, num2: b, operator: '−', correctAnswer: a - b };
  } else if (wave === 7) {
    const a = randInt(15, 65), b = randInt(15, 99 - a);
    return { num1: a, num2: b, operator: '+', correctAnswer: a + b };
  } else {
    if (Math.random() < 0.5) {
      const a = randInt(11, 70), b = randInt(10, 99 - a);
      return { num1: a, num2: b, operator: '+', correctAnswer: a + b };
    } else {
      const b = randInt(10, 50), a = randInt(b + 5, 99);
      return { num1: a, num2: b, operator: '−', correctAnswer: a - b };
    }
  }
}

function genMultFacts(wave) {
  let factors;
  if (wave === 1) factors = [1, 2];
  else if (wave === 2) factors = [3, 4];
  else if (wave === 3) factors = [5, 10];
  else if (wave === 4) factors = [6, 7];
  else if (wave === 5) factors = [8, 9];
  else if (wave === 6) factors = [11, 12];
  else factors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const a = factors[Math.floor(Math.random() * factors.length)];
  const b = randInt(1, 12);
  return { num1: a, num2: b, operator: '×', correctAnswer: a * b };
}

function genMentalMult(wave) {
  let factors;
  if (wave === 1) factors = [2, 3];
  else if (wave === 2) factors = [4, 5];
  else if (wave === 3) factors = [6, 7];
  else if (wave === 4) factors = [8, 9];
  else factors = [2, 3, 4, 5, 6, 7, 8, 9];

  const b = factors[Math.floor(Math.random() * factors.length)];
  const a = randInt(11, 99);
  return { num1: a, num2: b, operator: '×', correctAnswer: a * b };
}

// Fix wave 5 double digit issue
function fixProblem(p) {
  if (p.correctAnswer === 0 && p.operator === '+') {
    p.correctAnswer = p.num1 + p.num2;
  }
  return p;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  app: {
    fontFamily: "'Nunito', 'Fredoka One', sans-serif",
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    color: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
  },
  stars: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 16px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
};

// ============================================================================
// COMPONENTS
// ============================================================================

// --- Star Background ---
function StarBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
    }));
  }, []);

  return (
    <div style={styles.stars}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.left}%`,
          top: `${s.top}%`,
          width: `${s.size}px`,
          height: `${s.size}px`,
          borderRadius: '50%',
          background: '#fff',
          opacity: 0.6,
          animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

// --- Coin Display ---
function CoinDisplay({ coins, flash }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      background: flash ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.2)',
      borderRadius: '20px',
      fontSize: '20px',
      fontWeight: 700,
      transition: 'background 0.3s',
    }}>
      <span style={{ fontSize: '22px' }}>🪙</span>
      <span style={{ color: '#fef3c7' }}>{coins}</span>
    </div>
  );
}

// --- Title Screen ---
function TitleScreen({ gameState, onSelectMode, onVisitPuppy }) {
  return (
    <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center', padding: '20px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{
          fontFamily: "'Fredoka One', 'Nunito', sans-serif",
          fontSize: 'clamp(36px, 8vw, 56px)',
          margin: '0 0 4px 0',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}>
          Math Ninja
        </h1>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🐕‍🦺⚔️</div>
        <CoinDisplay coins={gameState.coins} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '500px' }}>
        {Object.values(MODES).map(mode => {
          const prog = gameState.progress[mode.id];
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.15)',
                borderRadius: '16px',
                padding: '16px 20px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>{mode.name}</div>
              <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '6px' }}>{mode.description}</div>
              <div style={{ fontSize: '13px', color: '#f59e0b' }}>
                🌊 {prog.currentWave} &nbsp; 🔥 {prog.bestStreak} &nbsp; 🏆 {prog.highScore}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onVisitPuppy}
        style={{
          marginTop: '20px',
          padding: '14px 32px',
          background: 'linear-gradient(135deg, #ec4899, #a855f7)',
          border: 'none',
          borderRadius: '30px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
        }}
      >
        🐶 My Puppy
      </button>
    </div>
  );
}

// --- Answer Grid (0-20) ---
function AnswerGrid({ onAnswer, disabledNums, flashGreen, flashRed }) {
  const row1 = Array.from({ length: 11 }, (_, i) => i);
  const row2 = Array.from({ length: 10 }, (_, i) => i + 11);

  const renderBtn = (num) => {
    const isGreen = flashGreen === num;
    const isRed = flashRed === num;
    const isDisabled = disabledNums.includes(num);
    return (
      <button
        key={num}
        onClick={() => !isDisabled && onAnswer(num)}
        disabled={isDisabled}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          border: '2px solid rgba(255,255,255,0.2)',
          background: isGreen ? '#22c55e' : isRed ? '#ef4444' : isDisabled ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 42, 0.6)',
          color: isDisabled ? 'rgba(255,255,255,0.3)' : '#fff',
          fontSize: '18px',
          fontWeight: 700,
          cursor: isDisabled ? 'default' : 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
          animation: isRed ? 'shake 0.3s' : 'none',
          boxShadow: isGreen ? '0 0 20px rgba(34,197,94,0.6)' : isRed ? '0 0 20px rgba(239,68,68,0.6)' : '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {num}
      </button>
    );
  };

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(10px)',
      borderTop: '3px solid rgba(139, 92, 42, 0.5)',
      padding: '12px 8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {row1.map(renderBtn)}
      </div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {row2.map(renderBtn)}
      </div>
    </div>
  );
}

// --- Number Pad (side-mounted, transparent) ---
function NumberPad({ value, onChange, onSubmit, maxDigits, flashState }) {
  const handleDigit = (d) => {
    if (value.length < maxDigits) onChange(value + d);
  };
  const handleBackspace = () => onChange(value.slice(0, -1));

  const btnStyle = {
    width: '64px',
    height: '56px',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.15)',
    background: 'rgba(139, 92, 42, 0.45)',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.1s',
    backdropFilter: 'blur(4px)',
  };

  return (
    <div style={{
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
    }}>
      {/* Answer display */}
      <div style={{
        width: '100%',
        height: '48px',
        background: flashState === 'correct' ? 'rgba(34,197,94,0.7)' : flashState === 'wrong' ? 'rgba(239,68,68,0.7)' : 'rgba(139, 92, 42, 0.35)',
        borderRadius: '12px',
        border: '2px solid rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontWeight: 700,
        letterSpacing: '4px',
        animation: flashState === 'wrong' ? 'shake 0.3s' : 'none',
        transition: 'background 0.2s',
        backdropFilter: 'blur(4px)',
      }}>
        {value || <span style={{ opacity: 0.3 }}>?</span>}
      </div>

      {/* Number grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: '6px' }}>
        {[7,8,9,4,5,6,1,2,3].map(d => (
          <button key={d} onClick={() => handleDigit(String(d))} style={btnStyle}>{d}</button>
        ))}
      </div>

      {/* Bottom row: 0, backspace, enter */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => handleDigit('0')} style={btnStyle}>0</button>
        <button onClick={handleBackspace} style={{ ...btnStyle, fontSize: '20px', background: 'rgba(100,100,100,0.35)' }}>⌫</button>
        <button onClick={onSubmit} style={{
          ...btnStyle,
          background: 'rgba(34, 197, 94, 0.5)',
          fontSize: '20px',
        }}>
          ✓
        </button>
      </div>
    </div>
  );
}

// --- Particles ---
function Particles({ particles }) {
  return (
    <>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}px`,
          top: `${p.y}px`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: p.color,
          opacity: p.opacity,
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'none',
        }} />
      ))}
    </>
  );
}

// --- Gameplay Screen ---
function GameplayScreen({ mode, wave, gameState, setGameState, onWaveComplete, onBack }) {
  const modeConfig = MODES[mode];
  const [problemIndex, setProblemIndex] = useState(0);
  const [problem, setProblem] = useState(() => fixProblem(generateProblem(mode, wave)));
  const [fruit, setFruit] = useState(randomFruit);
  const [fruitPos, setFruitPos] = useState({ x: 50, y: 20 });
  const [fruitRotation, setFruitRotation] = useState(0);
  const fruitPosRef = useRef({ x: 50, y: 20 });
  const fruitVelRef = useRef(null);
  const [numpadValue, setNumpadValue] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [disabledNums, setDisabledNums] = useState([]);
  const [gridFlashGreen, setGridFlashGreen] = useState(null);
  const [gridFlashRed, setGridFlashRed] = useState(null);
  const [numpadFlash, setNumpadFlash] = useState(null);
  const [sliceActive, setSliceActive] = useState(false);
  const [slicePos, setSlicePos] = useState({ x: 50, y: 50 });
  const [isPerfect, setIsPerfect] = useState(false);
  const [paused, setPaused] = useState(false);
  const [particles, setParticles] = useState([]);
  const [coinFlash, setCoinFlash] = useState(false);
  const [perfectText, setPerfectText] = useState(false);

  const startTimeRef = useRef(Date.now());
  const animFrameRef = useRef(null);
  const playAreaRef = useRef(null);
  const problemActiveRef = useRef(true);
  const particleIdRef = useRef(0);
  const streakRef = useRef(0);

  useEffect(() => { streakRef.current = streak; }, [streak]);

  // Fruit bouncing animation (DVD screensaver style)
  useEffect(() => {
    if (paused) return;
    startTimeRef.current = Date.now();
    problemActiveRef.current = true;

    // Initialize velocity on new problem
    if (!fruitVelRef.current) {
      const angle = Math.random() * Math.PI * 2;
      fruitVelRef.current = {
        vx: Math.cos(angle) * BOUNCE_SPEED,
        vy: Math.sin(angle) * BOUNCE_SPEED,
      };
      const startPos = { x: 20 + Math.random() * 60, y: 15 + Math.random() * 25 };
      fruitPosRef.current = startPos;
      setFruitPos(startPos);
    }

    let lastTime = Date.now();
    const animate = () => {
      if (!problemActiveRef.current) return;
      const now = Date.now();
      const dt = now - lastTime;
      lastTime = now;

      const pos = fruitPosRef.current;
      const vel = fruitVelRef.current;
      let nx = pos.x + vel.vx * dt;
      let ny = pos.y + vel.vy * dt;

      // Bounce off walls (10% margin on sides, 5% top, 15% bottom)
      if (nx < 10 || nx > 90) {
        vel.vx *= -1;
        nx = nx < 10 ? 10 : 90;
      }
      if (ny < 5 || ny > 85) {
        vel.vy *= -1;
        ny = ny < 5 ? 5 : 85;
      }

      const newPos = { x: nx, y: ny };
      fruitPosRef.current = newPos;
      setFruitPos(newPos);
      setFruitRotation(prev => prev + dt * 0.05);

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [problemIndex, paused]);

  const spawnParticles = (pos, color, count = 10) => {
    const area = playAreaRef.current;
    if (!area) return;
    const centerX = (pos.x / 100) * area.offsetWidth;
    const newParticles = Array.from({ length: count }, () => {
      const id = particleIdRef.current++;
      return {
        id,
        x: centerX + randInt(-30, 30),
        y: (pos.y / 100) * (area.offsetHeight - 60) + 30,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        size: randInt(6, 14),
        color,
        opacity: 1,
      };
    });
    setParticles(prev => [...prev, ...newParticles]);

    // Animate particles
    let frame = 0;
    const animateParticles = () => {
      frame++;
      setParticles(prev => prev.map(p => {
        if (!newParticles.find(np => np.id === p.id)) return p;
        return {
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy + frame * 0.3,
          opacity: Math.max(0, p.opacity - 0.03),
        };
      }).filter(p => p.opacity > 0));
      if (frame < 30) requestAnimationFrame(animateParticles);
    };
    requestAnimationFrame(animateParticles);
  };

  const handleCorrect = (answerTime) => {
    if (!problemActiveRef.current) return;
    problemActiveRef.current = false;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const perfect = answerTime < PERFECT_TIME;
    const currentPos = { ...fruitPosRef.current };

    setSliceActive(true);
    setSlicePos(currentPos);
    setIsPerfect(perfect);

    const earnedCoins = 5 + (perfect ? 5 : 0);
    setCoinsEarned(prev => prev + earnedCoins);
    setScore(prev => prev + (perfect ? 20 : 10));
    setCorrectCount(prev => prev + 1);
    if (perfect) {
      setPerfectCount(prev => prev + 1);
      setPerfectText(true);
      setTimeout(() => setPerfectText(false), 1000);
    }

    const newStreak = streakRef.current + 1;
    setStreak(newStreak);
    setBestStreak(prev => Math.max(prev, newStreak));
    setCoinFlash(true);
    setTimeout(() => setCoinFlash(false), 300);

    spawnParticles(currentPos, fruit.color, perfect ? 20 : 10);

    setTimeout(() => {
      setSliceActive(false);
      nextProblem();
    }, 800);
  };

  const handleWrong = () => {
    setStreak(0);
    streakRef.current = 0;
  };

  const nextProblem = () => {
    const next = problemIndex + 1;
    if (next >= PROBLEMS_PER_WAVE) {
      finishWave();
      return;
    }
    setProblemIndex(next);
    setProblem(fixProblem(generateProblem(mode, wave)));
    setFruit(randomFruit());
    setFruitPos({ x: 50, y: 20 });
    fruitPosRef.current = { x: 50, y: 20 };
    fruitVelRef.current = null;
    setNumpadValue('');
    setDisabledNums([]);
    setGridFlashGreen(null);
    setGridFlashRed(null);
    setNumpadFlash(null);
  };

  const finishWave = () => {
    const baseCoins = 50;
    const answerCoins = coinsEarned;
    const accuracyBonus = (correctCount / PROBLEMS_PER_WAVE) >= 0.9 ? 20 : 0;
    const streakBonus = bestStreak * 2;
    const totalCoins = baseCoins + answerCoins + accuracyBonus + streakBonus;

    // Decay pet meters
    const decayMult = gameState.pet.purchasedItems.includes('cozy_bed') ? 0.65 : gameState.pet.purchasedItems.includes('bed') ? 0.8 : 1;
    const happyPassive = (gameState.pet.purchasedItems.includes('toy_ball') ? 2 : 0) + (gameState.pet.purchasedItems.includes('chew_rope') ? 2 : 0);

    const newState = {
      ...gameState,
      coins: gameState.coins + totalCoins,
      pet: {
        ...gameState.pet,
        hunger: Math.max(0, gameState.pet.hunger - 12 * decayMult),
        thirst: Math.max(0, gameState.pet.thirst - 12 * decayMult),
        happiness: Math.min(100, Math.max(0, gameState.pet.happiness - 5 * decayMult + happyPassive)),
      },
      progress: {
        ...gameState.progress,
        [mode]: {
          currentWave: Math.max(gameState.progress[mode].currentWave, wave + 1),
          highScore: Math.max(gameState.progress[mode].highScore, score),
          bestStreak: Math.max(gameState.progress[mode].bestStreak, bestStreak),
        },
      },
    };

    setGameState(newState);
    saveState(newState);

    onWaveComplete({
      wave,
      score,
      correctCount,
      totalProblems: PROBLEMS_PER_WAVE,
      perfectCount,
      bestStreak,
      coinsEarned: totalCoins,
      accuracy: Math.round((correctCount / PROBLEMS_PER_WAVE) * 100),
    });
  };

  // Grid answer handler
  const handleGridAnswer = (num) => {
    if (!problemActiveRef.current) return;
    const elapsed = Date.now() - startTimeRef.current;
    if (num === problem.correctAnswer) {
      setGridFlashGreen(num);
      setTimeout(() => setGridFlashGreen(null), 500);
      handleCorrect(elapsed);
    } else {
      setGridFlashRed(num);
      setTimeout(() => setGridFlashRed(null), 400);
      setDisabledNums(prev => [...prev, num]);
      handleWrong();
    }
  };

  // Numpad submit handler
  const handleNumpadSubmit = () => {
    if (!problemActiveRef.current || !numpadValue) return;
    const elapsed = Date.now() - startTimeRef.current;
    const answer = parseInt(numpadValue, 10);
    if (answer === problem.correctAnswer) {
      setNumpadFlash('correct');
      setTimeout(() => setNumpadFlash(null), 500);
      handleCorrect(elapsed);
    } else {
      setNumpadFlash('wrong');
      setTimeout(() => {
        setNumpadFlash(null);
        setNumpadValue('');
      }, 400);
      handleWrong();
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (modeConfig.inputType === 'numpad') {
        if (e.key >= '0' && e.key <= '9') {
          setNumpadValue(prev => prev.length < modeConfig.maxDigits ? prev + e.key : prev);
        } else if (e.key === 'Backspace') {
          setNumpadValue(prev => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          handleNumpadSubmit();
        }
      } else if (modeConfig.inputType === 'grid') {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 0 && num <= 9) {
          handleGridAnswer(num);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [numpadValue, problem, modeConfig]);

  const streakFire = streak >= 10 ? '🔥🔥🔥' : streak >= 7 ? '🔥🔥' : streak >= 5 ? '🔥' : streak >= 3 ? '🔥' : '';


  return (
    <div style={styles.app}>
      <StarBackground />
      <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* HUD — compact single bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 12px',
          background: 'rgba(0,0,0,0.3)',
          borderBottom: '2px solid rgba(255,255,255,0.1)',
        }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            padding: '4px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>🏠</button>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {Array.from({ length: PROBLEMS_PER_WAVE }, (_, i) => (
              <span key={i} style={{ opacity: i < problemIndex ? 1 : i === problemIndex ? 1 : 0.3, fontSize: '8px' }}>
                {i <= problemIndex ? '●' : '○'}
              </span>
            ))}
          </div>
          <span style={{ fontSize: '14px' }}>🏆 {score}</span>
          <span style={{
            fontSize: '14px',
            color: streak >= 5 ? '#f59e0b' : streak >= 3 ? '#fb923c' : '#fff',
            fontWeight: streak >= 3 ? 800 : 600,
          }}>
            {streakFire} {streak > 0 ? streak : ''}
          </span>
          <CoinDisplay coins={gameState.coins + coinsEarned} flash={coinFlash} />
        </div>

        {/* Problem Banner — compact */}
        <div style={{
          textAlign: 'center',
          padding: '6px 10px',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{
            fontSize: 'clamp(28px, 6vw, 44px)',
            fontWeight: 800,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            lineHeight: 1.1,
          }}>
            {problem.num1} {problem.operator} {problem.num2} = ?
          </div>
        </div>

        {/* Main content area — side-by-side for numpad, stacked for grid */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: modeConfig.inputType === 'numpad' ? 'row' : 'column',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Play Area */}
          <div ref={playAreaRef} style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            minHeight: '200px',
          }}>
            <Particles particles={particles} />

            {/* Perfect text */}
            {perfectText && (
              <div style={{
                position: 'absolute',
                top: '40%',
                left: modeConfig.inputType === 'numpad' ? '40%' : '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '36px',
                fontWeight: 800,
                color: '#f59e0b',
                textShadow: '0 0 20px rgba(245,158,11,0.8)',
                animation: 'fadeUp 1s forwards',
                zIndex: 20,
                pointerEvents: 'none',
              }}>
                ⚡ Perfect!
              </div>
            )}

            {/* Bouncing Fruit */}
            {!sliceActive && (
              <div style={{
                position: 'absolute',
                top: `${fruitPos.y}%`,
                left: `${fruitPos.x}%`,
                transform: `translate(-50%, -50%) rotate(${fruitRotation}deg)`,
                fontSize: '56px',
                transition: 'none',
                zIndex: 5,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}>
                {fruit.emoji}
              </div>
            )}

            {/* Slice Effect */}
            {sliceActive && (
              <>
                {/* Slash line */}
                <div style={{
                  position: 'absolute',
                  top: `${slicePos.y}%`,
                  left: `${Math.max(0, slicePos.x - 30)}%`,
                  width: '60%',
                  height: '4px',
                  background: isPerfect
                    ? 'linear-gradient(90deg, transparent, #f59e0b, #fff, #f59e0b, transparent)'
                    : 'linear-gradient(90deg, transparent, #fff, transparent)',
                  transform: 'rotate(-15deg)',
                  animation: 'slashIn 0.2s ease-out',
                  zIndex: 15,
                  boxShadow: isPerfect ? '0 0 20px rgba(245,158,11,0.8)' : '0 0 10px rgba(255,255,255,0.5)',
                }} />
                {/* Split halves */}
                <div style={{
                  position: 'absolute',
                  top: `${slicePos.y}%`,
                  left: `calc(${slicePos.x}% - 20px)`,
                  fontSize: '56px',
                  animation: isPerfect ? 'splitLeftSpin 0.6s ease-out forwards' : 'splitLeft 0.6s ease-out forwards',
                  zIndex: 6,
                  opacity: 0.8,
                  clipPath: 'inset(0 50% 0 0)',
                }}>
                  {fruit.emoji}
                </div>
                <div style={{
                  position: 'absolute',
                  top: `${slicePos.y}%`,
                  left: `calc(${slicePos.x}% + 20px)`,
                  fontSize: '56px',
                  animation: isPerfect ? 'splitRightSpin 0.6s ease-out forwards' : 'splitRight 0.6s ease-out forwards',
                  zIndex: 6,
                  opacity: 0.8,
                  clipPath: 'inset(0 0 0 50%)',
                }}>
                  {fruit.emoji}
                </div>
                {/* Screen flash for perfect */}
                {isPerfect && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.15)',
                    animation: 'flashFade 0.4s ease-out forwards',
                    zIndex: 14,
                    pointerEvents: 'none',
                  }} />
                )}
              </>
            )}

          </div>

          {/* Input Area */}
          {modeConfig.inputType === 'grid' ? (
            <AnswerGrid
              onAnswer={handleGridAnswer}
              disabledNums={disabledNums}
              flashGreen={gridFlashGreen}
              flashRed={gridFlashRed}
            />
          ) : (
            /* Numpad — floats on the right side */
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <NumberPad
                value={numpadValue}
                onChange={setNumpadValue}
                onSubmit={handleNumpadSubmit}
                maxDigits={modeConfig.maxDigits}
                flashState={numpadFlash}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Wave Complete Screen ---
function WaveCompleteScreen({ stats, onNextWave, onVisitPuppy, onMenu, gameState }) {
  const starCount = stats.accuracy >= 90 ? 3 : stats.accuracy >= 70 ? 2 : 1;
  const [showStars, setShowStars] = useState(0);

  useEffect(() => {
    const timers = [];
    for (let i = 1; i <= starCount; i++) {
      timers.push(setTimeout(() => setShowStars(i), i * 400));
    }
    return () => timers.forEach(clearTimeout);
  }, [starCount]);

  return (
    <div style={{ ...styles.app, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <StarBackground />
      <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: "'Fredoka One', sans-serif",
          fontSize: '36px',
          margin: '0 0 10px',
          color: '#f59e0b',
        }}>
          Great Job!
        </h2>

        {/* Stars */}
        <div style={{ fontSize: '48px', margin: '10px 0 20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {[1, 2, 3].map(i => (
            <span key={i} style={{
              opacity: i <= showStars ? 1 : 0.2,
              transform: i <= showStars ? 'scale(1)' : 'scale(0.5)',
              transition: 'all 0.4s ease-out',
              filter: i <= showStars ? 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' : 'none',
            }}>⭐</span>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          width: '100%',
          maxWidth: '350px',
        }}>
          <div style={statRow}>
            <span>🎯 Accuracy</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{stats.accuracy}%</span>
          </div>
          <div style={statRow}>
            <span>🔥 Streak</span>
            <span style={{ fontWeight: 700 }}>{stats.bestStreak}</span>
          </div>
          <div style={statRow}>
            <span>⚡ In a Snap</span>
            <span style={{ color: '#a855f7', fontWeight: 700 }}>{stats.perfectCount}</span>
          </div>
          <div style={{ ...statRow, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: '6px' }}>
            <span>🪙</span>
            <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '20px' }}>+{stats.coinsEarned}</span>
          </div>
        </div>

        {/* Pet Status */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.15)',
          borderRadius: '12px',
          padding: '12px 20px',
          marginBottom: '20px',
          fontSize: '14px',
          width: '100%',
          maxWidth: '350px',
        }}>
          <div style={{ marginBottom: '4px', fontWeight: 700 }}>🐶 Your Puppy</div>
          <MeterBar label="🍖" value={gameState.pet.hunger} color="#ef4444" />
          <MeterBar label="💧" value={gameState.pet.thirst} color="#3b82f6" />
          <MeterBar label="😊" value={gameState.pet.happiness} color="#eab308" />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={onNextWave} style={bigBtnStyle('#22c55e', '#16a34a')}>
            Next! →
          </button>
          <button onClick={onVisitPuppy} style={bigBtnStyle('#ec4899', '#a855f7')}>
            🐶 My Puppy
          </button>
          <button onClick={onMenu} style={bigBtnStyle('#6b7280', '#4b5563')}>
            🏠
          </button>
        </div>
      </div>
    </div>
  );
}

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '6px 0',
  fontSize: '16px',
};

function bigBtnStyle(c1, c2) {
  return {
    padding: '14px 28px',
    background: `linear-gradient(135deg, ${c1}, ${c2})`,
    border: 'none',
    borderRadius: '16px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: `0 4px 15px rgba(0,0,0,0.3)`,
  };
}

// --- Meter Bar ---
function MeterBar({ label, value, color }) {
  const outOf10 = Math.round(value / 10);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
      <span style={{ width: '28px', fontSize: '16px', textAlign: 'center' }}>{label}</span>
      <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: value < 30 ? '#ef4444' : color,
          borderRadius: '6px',
          transition: 'width 0.5s, background 0.5s',
        }} />
      </div>
      <span style={{ width: '38px', fontSize: '14px', textAlign: 'right', fontWeight: 700 }}>{outOf10}/10</span>
    </div>
  );
}

// --- Puppy Room (SVG Scene) ---
function PuppyRoom({ room, pet, onPet, isPetting = false, onDragEnd }) {
  const items = room.purchasedItems || [];
  const isDojo = items.includes('ninja_dojo_makeover');
  const saved = room.itemPositions || {};
  const svgRef = useRef(null);
  const [dragState, setDragState] = useState(null);

  // Wall color
  const wallColor = isDojo ? '#2d1810'
    : room.wallPaint ? WALL_PAINTS[room.wallPaint]?.color || '#d4b896'
    : '#d4b896';

  // Floor color
  const floorColor = isDojo ? '#8b7355'
    : room.flooring ? (FLOOR_OPTIONS[room.flooring]?.color || '#b8956a')
    : '#b8956a';

  const floorPattern = isDojo ? 'tatami' : room.flooring ? (FLOOR_OPTIONS[room.flooring]?.pattern || null) : null;
  const wallpaperPattern = isDojo ? null : room.wallpaper ? (WALLPAPERS[room.wallpaper]?.pattern || null) : null;

  // Convert screen coordinates to SVG viewBox coordinates
  const screenToSVG = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: svgPt.x, y: svgPt.y };
  };

  // Get resolved position for an item (drag-in-progress or saved/default)
  const pos = (id) => {
    if (dragState?.itemId === id && dragState.isDragging) {
      const dx = dragState.currentSVG.x - dragState.startSVG.x;
      const dy = dragState.currentSVG.y - dragState.startSVG.y;
      return { x: dragState.origPos.x + dx, y: dragState.origPos.y + dy };
    }
    return getItemPos(id, saved);
  };

  const handlePointerDown = (e, itemId) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const svgPt = screenToSVG(e.clientX, e.clientY);
    setDragState({
      itemId,
      startSVG: svgPt,
      currentSVG: svgPt,
      origPos: getItemPos(itemId, saved),
      isDragging: false,
    });
  };

  const handlePointerMove = (e) => {
    if (!dragState) return;
    const svgPt = screenToSVG(e.clientX, e.clientY);
    const dx = svgPt.x - dragState.startSVG.x;
    const dy = svgPt.y - dragState.startSVG.y;
    const isDragging = dragState.isDragging || Math.sqrt(dx * dx + dy * dy) > 5;
    setDragState(prev => ({ ...prev, currentSVG: svgPt, isDragging }));
  };

  const handlePointerUp = () => {
    if (!dragState) return;
    if (dragState.isDragging && onDragEnd) {
      const dx = dragState.currentSVG.x - dragState.startSVG.x;
      const dy = dragState.currentSVG.y - dragState.startSVG.y;
      const newX = clamp(dragState.origPos.x + dx, -20, 380);
      const newY = clamp(dragState.origPos.y + dy, -20, 280);
      onDragEnd(dragState.itemId, { x: newX, y: newY });
    } else if (!dragState.isDragging && dragState.itemId === 'puppy') {
      onPet();
    }
    setDragState(null);
  };

  // Helper: render a draggable item. source='room' or 'pet' determines which list to check.
  const D = (id, renderFn, { source = 'room', condition = true } = {}) => {
    const list = source === 'pet' ? pet.purchasedItems : items;
    if (!list.includes(id) || !condition) return null;
    const p = pos(id);
    const dragging = dragState?.itemId === id && dragState.isDragging;
    return (
      <g key={id} onPointerDown={(e) => handlePointerDown(e, id)}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        opacity={dragging ? 0.8 : 1}>
        {renderFn(p)}
      </g>
    );
  };

  // Helper for SVG-group items: offset the group by delta from default position
  const svgGroupPos = (id) => {
    const p = pos(id);
    const def = DEFAULT_ITEM_POSITIONS[id];
    return { dx: p.x - def.x, dy: p.y - def.y };
  };

  return (
    <svg ref={svgRef} viewBox="0 0 400 300"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
      style={{ width: '100%', maxWidth: '420px', borderRadius: '18px', overflow: 'hidden', display: 'block', touchAction: 'none' }}>
      <defs>
        {/* Floor patterns */}
        <pattern id="checkered" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#ccc" />
          <rect x="10" y="10" width="10" height="10" fill="#ccc" />
          <rect x="10" width="10" height="10" fill="#eee" />
          <rect y="10" width="10" height="10" fill="#eee" />
        </pattern>
        <pattern id="tatami" width="40" height="20" patternUnits="userSpaceOnUse">
          <rect width="40" height="20" fill="#c4b78c" />
          <line x1="0" y1="0" x2="40" y2="0" stroke="#b0a070" strokeWidth="0.8" />
          <line x1="20" y1="0" x2="20" y2="20" stroke="#b0a070" strokeWidth="0.5" />
        </pattern>
        {/* Wallpaper patterns */}
        <pattern id="wp-stars" width="30" height="30" patternUnits="userSpaceOnUse">
          <polygon points="15,2 17,11 26,11 19,16 21,25 15,20 9,25 11,16 4,11 13,11" fill="rgba(255,255,255,0.08)" />
        </pattern>
        <pattern id="wp-stripes" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="6" height="12" fill="rgba(255,255,255,0.06)" />
        </pattern>
        <pattern id="wp-ninja" width="40" height="40" patternUnits="userSpaceOnUse">
          <text x="12" y="25" fontSize="16" fill="rgba(255,255,255,0.06)" textAnchor="middle">⭐</text>
        </pattern>
      </defs>

      {/* ===== BACK WALL ===== */}
      <rect x="0" y="0" width="400" height="200" fill={wallColor} />

      {/* Wallpaper overlay */}
      {wallpaperPattern === 'stars' && <rect x="0" y="0" width="400" height="200" fill="url(#wp-stars)" />}
      {wallpaperPattern === 'stripes' && <rect x="0" y="0" width="400" height="200" fill="url(#wp-stripes)" />}
      {wallpaperPattern === 'ninja' && <rect x="0" y="0" width="400" height="200" fill="url(#wp-ninja)" />}

      {/* Wall/floor divider line */}
      <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />

      {/* ===== FLOOR ===== */}
      {floorPattern === 'checkered' ? (
        <rect x="0" y="200" width="400" height="100" fill="url(#checkered)" />
      ) : floorPattern === 'tatami' ? (
        <rect x="0" y="200" width="400" height="100" fill="url(#tatami)" />
      ) : (
        <rect x="0" y="200" width="400" height="100" fill={floorColor} />
      )}

      {/* Floor wood lines (default/wood) */}
      {!floorPattern && (
        <g opacity="0.15">
          <line x1="0" y1="225" x2="400" y2="225" stroke="#000" strokeWidth="0.5" />
          <line x1="0" y1="250" x2="400" y2="250" stroke="#000" strokeWidth="0.5" />
          <line x1="0" y1="275" x2="400" y2="275" stroke="#000" strokeWidth="0.5" />
        </g>
      )}

      {/* Dojo decoration */}
      {isDojo && (
        <g>
          <rect x="5" y="10" width="12" height="185" rx="3" fill="#6b8e4e" opacity="0.4" />
          <rect x="383" y="10" width="12" height="185" rx="3" fill="#6b8e4e" opacity="0.4" />
          <circle cx="200" cy="60" r="35" fill="#dc2626" opacity="0.2" />
          <g>
            <line x1="80" y1="0" x2="80" y2="25" stroke="#a16207" strokeWidth="1" />
            <ellipse cx="80" cy="30" rx="10" ry="12" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
            <rect x="74" y="20" width="12" height="3" rx="1" fill="#d97706" />
          </g>
          <g>
            <line x1="320" y1="0" x2="320" y2="25" stroke="#a16207" strokeWidth="1" />
            <ellipse cx="320" cy="30" rx="10" ry="12" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
            <rect x="314" y="20" width="12" height="3" rx="1" fill="#d97706" />
          </g>
        </g>
      )}

      {/* ===== CEILING ZONE ===== */}
      {D('fairy_lights', (p) => <image href="/assets/fairy-lights.png" x={p.x} y={p.y} width="420" height="100" />)}
      {D('hanging_plant', (p) => <image href="/assets/hanging-plant.png" x={p.x} y={p.y} width="155" height="100" />)}
      {D('banner', (p) => {
        const d = svgGroupPos('banner');
        return (
          <g transform={`translate(${d.dx}, ${d.dy})`}>
            <line x1="130" y1="5" x2="270" y2="5" stroke="#92400e" strokeWidth="2" />
            {[140,160,180,200,220,240,260].map((x, i) => (
              <polygon key={i} points={`${x-8},8 ${x+8},8 ${x},28`}
                fill={['#ef4444','#f97316','#fbbf24','#22c55e','#3b82f6','#a855f7','#ec4899'][i]}
                stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
            ))}
          </g>
        );
      })}
      {D('disco_ball', (p) => <image href="/assets/disco-ball.png" x={p.x} y={p.y} width="90" height="82" />)}

      {/* ===== WALL-L ZONE ===== */}
      {D('paw_poster', (p) => <image href="/assets/paw-poster.png" x={p.x} y={p.y} width="95" height="95" />)}
      {D('ninja_poster', (p) => <image href="/assets/ninja-poster.png" x={p.x} y={p.y} width="95" height="95" />)}

      {/* ===== WALL-C ZONE ===== */}
      {D('tv', (p) => <image href="/assets/tv.png" x={p.x} y={p.y} width="165" height="148" />)}
      {D('gaming_console', (p) => <image href="/assets/gaming-console.png" x={p.x} y={p.y} width="90" height="85" />)}

      {/* ===== WALL-R ZONE ===== */}
      {D('space_poster', (p) => <image href="/assets/space-poster.png" x={p.x} y={p.y} width="95" height="95" />)}
      {D('clock', (p) => {
        const d = svgGroupPos('clock');
        return (
          <g transform={`translate(${d.dx}, ${d.dy})`}>
            <circle cx="340" cy="90" r="18" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />
            <circle cx="340" cy="90" r="15" fill="#fff8e7" />
            <line x1="340" y1="90" x2="340" y2="78" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="340" y1="90" x2="348" y2="90" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
          </g>
        );
      })}
      {D('picture_frame', (p) => <image href="/assets/picture-frame.png" x={p.x} y={p.y} width="70" height="70" />)}
      {D('small_shelf', (p) => <image href="/assets/small-shelf.png" x={p.x} y={p.y} width="105" height="80" />)}

      {/* ===== FLOOR-L ZONE ===== */}
      {D('couch', (p) => {
        const d = svgGroupPos('couch');
        return (
          <g transform={`translate(${d.dx}, ${d.dy})`}>
            <rect x="20" y="215" width="100" height="50" rx="12" fill="#6366f1" stroke="#4f46e5" strokeWidth="2.5" />
            <rect x="24" y="210" width="22" height="55" rx="8" fill="#818cf8" stroke="#6366f1" strokeWidth="1.5" />
            <rect x="94" y="210" width="22" height="55" rx="8" fill="#818cf8" stroke="#6366f1" strokeWidth="1.5" />
            <ellipse cx="55" cy="235" rx="20" ry="8" fill="#818cf8" opacity="0.5" />
            <ellipse cx="85" cy="235" rx="16" ry="7" fill="#818cf8" opacity="0.4" />
          </g>
        );
      })}
      {D('armchair', (p) => <image href="/assets/armchair.png" x={p.x} y={p.y} width="110" height="90" />, { condition: !items.includes('couch') })}
      {D('bean_bag', (p) => <image href="/assets/bean-bag.png" x={p.x} y={p.y} width="105" height="85" />, { condition: !items.includes('couch') && !items.includes('armchair') })}
      {D('bookshelf', (p) => <image href="/assets/bookshelf.png" x={p.x} y={p.y} width="110" height="170" />)}
      {D('fish_tank', (p) => <image href="/assets/fish-tank.png" x={p.x} y={p.y} width="90" height="85" />)}
      {D('skateboard_ramp', (p) => <image href="/assets/skateboard-ramp.png" x={p.x} y={p.y} width="115" height="82" />)}
      {D('ninja_dummy', (p) => {
        const d = svgGroupPos('ninja_dummy');
        return (
          <g transform={`translate(${d.dx}, ${d.dy})`}>
            <rect x="70" y="230" width="8" height="45" rx="2" fill="#92400e" />
            <circle cx="74" cy="225" r="12" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />
            <circle cx="70" cy="222" r="2" fill="#1e293b" />
            <circle cx="78" cy="222" r="2" fill="#1e293b" />
            <rect x="68" y="230" width="12" height="3" rx="1" fill="#dc2626" />
          </g>
        );
      })}

      {/* ===== FLOOR-C ZONE ===== */}
      {D('large_rug', (p) => <image href="/assets/large-rug.png" x={p.x} y={p.y} width="195" height="120" />)}
      {D('small_rug', (p) => <image href="/assets/small-rug.png" x={p.x} y={p.y} width="145" height="95" />, { condition: !items.includes('large_rug') })}
      {D('ball_pit', (p) => <image href="/assets/ball-pit.png" x={p.x} y={p.y} width="130" height="85" />)}

      {/* ===== PUPPY ===== */}
      {(() => {
        const p = pos('puppy');
        const dragging = dragState?.itemId === 'puppy' && dragState.isDragging;
        return (
          <g onPointerDown={(e) => handlePointerDown(e, 'puppy')}
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
            opacity={dragging ? 0.8 : 1}>
            <g transform={`translate(${p.x}, ${p.y})`}>
              <PuppySVGInline pet={pet} isPetting={isPetting} />
            </g>
          </g>
        );
      })()}

      {/* ===== FLOOR-R ZONE ===== */}
      {D('side_table', (p) => <image href="/assets/side-table.png" x={p.x} y={p.y} width="100" height="115" />)}
      {D('lamp', (p) => <image href="/assets/lamp.png" x={p.x} y={p.y} width="68" height="82" />)}
      {D('radio', (p) => <image href="/assets/radio.png" x={p.x} y={p.y} width="55" height="55" />)}
      {D('lava_lamp', (p) => <image href="/assets/lava-lamp.png" x={p.x} y={p.y} width="60" height="85" />)}
      {D('tiny_trampoline', (p) => <image href="/assets/tiny-trampoline.png" x={p.x} y={p.y} width="88" height="62" />)}
      {D('rocket_toy', (p) => {
        const d = svgGroupPos('rocket_toy');
        return (
          <g transform={`translate(${d.dx}, ${d.dy})`}>
            <g transform="translate(370, 215)">
              <rect x="-8" y="0" width="16" height="40" rx="6" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.5" />
              <polygon points="-8,40 -14,50 8,40" fill="#ef4444" />
              <polygon points="8,40 14,50 -8,40" fill="#ef4444" />
              <polygon points="0,-8 -6,5 6,5" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
              <circle cx="0" cy="18" r="5" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
            </g>
          </g>
        );
      })}

      {/* ===== FRONT-L ZONE ===== */}
      {D('food_bowl', (p) => <image href="/assets/food-bowl.png" x={p.x} y={p.y} width="70" height="70" />, { source: 'pet' })}
      {D('water_bowl', (p) => <image href="/assets/water-bowl.png" x={p.x} y={p.y} width="65" height="65" />, { source: 'pet' })}

      {/* ===== FRONT-R ZONE ===== */}
      {D('toy_basket', (p) => <image href="/assets/toy-basket.png" x={p.x} y={p.y} width="95" height="80" />)}
      {D('bed', (p) => (
        <g>
          <image href="/assets/bed.png" x={p.x} y={p.y} width="88" height="72" />
          {pet.purchasedItems.includes('cozy_bed') && (
            <>
              <ellipse cx={p.x + 44} cy={p.y + 15} rx="12" ry="6" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />
              <rect x={p.x + 17} y={p.y + 63} width="50" height="6" rx="2" fill="#fecaca" opacity="0.6" />
            </>
          )}
        </g>
      ), { source: 'pet' })}
      {D('toy_ball', (p) => <image href="/assets/toy-ball.png" x={p.x} y={p.y} width="48" height="46" />, { source: 'pet' })}
      {D('chew_rope', (p) => <image href="/assets/chew-rope.png" x={p.x} y={p.y} width="75" height="55" />, { source: 'pet' })}
    </svg>
  );
}

// Inline SVG puppy for use inside PuppyRoom (no wrapper div, no click handler — room handles that)
const PUPPY_IMAGES = {
  thriving: '/assets/puppy-happy.png',
  content: '/assets/puppy-content.png',
  hungry: '/assets/puppy-sad.png',
  thirsty: '/assets/puppy-sad.png',
  sad: '/assets/puppy-sad.png',
  neglected: '/assets/puppy-neglected.png',
  pet: '/assets/puppy-pet.png',
};

function PuppySVGInline({ pet, isPetting }) {
  const getState = () => {
    if (pet.hunger < 10 && pet.thirst < 10) return 'neglected';
    if (pet.hunger < 30) return 'hungry';
    if (pet.thirst < 30) return 'thirsty';
    if (pet.happiness < 30) return 'sad';
    if (pet.hunger > 60 && pet.thirst > 60 && pet.happiness > 60) return 'thriving';
    return 'content';
  };
  const state = getState();
  const src = isPetting ? PUPPY_IMAGES.pet : PUPPY_IMAGES[state];
  const imgSize = 100;

  return (
    <image
      href={src}
      x={-imgSize / 2}
      y={-imgSize / 2}
      width={imgSize}
      height={imgSize}
      style={{
        animation: state === 'thriving' ? 'bounce 2s infinite' : state === 'neglected' ? 'shiver 0.3s infinite' : 'none',
        filter: state === 'neglected' ? 'saturate(0.7) brightness(0.9)' : 'none',
      }}
    />
  );
}

// --- Puppy Home Screen ---
function PuppyHomeScreen({ gameState, setGameState, onBack, onPlay }) {
  const [showShop, setShowShop] = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [buyAnimation, setBuyAnimation] = useState(null);
  const [wiggle, setWiggle] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [hearts, setHearts] = useState([]);
  const heartIdRef = useRef(0);

  const handlePetPuppy = () => {
    const boosts = [5, 3, 1, 0];
    const boost = boosts[Math.min(petCount, boosts.length - 1)];
    if (boost > 0) {
      const newState = {
        ...gameState,
        pet: {
          ...gameState.pet,
          happiness: Math.min(100, gameState.pet.happiness + boost),
        },
      };
      setGameState(newState);
      saveState(newState);
    }
    setPetCount(prev => prev + 1);
    // Hearts + wiggle + pet image
    setWiggle(true);
    setIsPetting(true);
    setTimeout(() => setWiggle(false), 600);
    setTimeout(() => setIsPetting(false), 1200);
    const newHearts = Array.from({ length: 3 }, () => ({
      id: heartIdRef.current++,
      x: randInt(-60, 60),
      delay: Math.random() * 0.3,
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 1500);
  };

  const handleDragEnd = (itemId, newPos) => {
    const newState = {
      ...gameState,
      room: {
        ...gameState.room,
        itemPositions: {
          ...(gameState.room.itemPositions || {}),
          [itemId]: { x: newPos.x, y: newPos.y },
        },
      },
    };
    setGameState(newState);
    saveState(newState);
  };

  const handleBuy = (itemId) => {
    const item = SHOP_ITEMS[itemId];
    if (!item || gameState.coins < item.cost) return;

    let newState = { ...gameState, coins: gameState.coins - item.cost };
    let petUpdate = { ...newState.pet };

    if (item.oneTime) {
      petUpdate.purchasedItems = [...petUpdate.purchasedItems, itemId];
      if (item.happinessBoost) {
        petUpdate.happiness = Math.min(100, petUpdate.happiness + item.happinessBoost);
      }
      if (item.roomTheme) {
        petUpdate.roomTheme = item.roomTheme;
      }
    } else {
      // Consumable
      if (item.stat === 'hunger') {
        petUpdate.hunger = Math.min(100, petUpdate.hunger + item.amount);
      } else if (item.stat === 'thirst') {
        petUpdate.thirst = Math.min(100, petUpdate.thirst + item.amount);
      } else if (item.stat === 'treat') {
        petUpdate.hunger = Math.min(100, petUpdate.hunger + item.hungerAmt);
        petUpdate.happiness = Math.min(100, petUpdate.happiness + item.happyAmt);
      }
    }

    newState.pet = petUpdate;
    setGameState(newState);
    saveState(newState);

    setBuyAnimation(itemId);
    setTimeout(() => setBuyAnimation(null), 600);
  };

  const handleBuyRoom = (itemId, itemType) => {
    // itemType: 'room_item', 'wall_paint', 'wallpaper', 'flooring'
    let cost = 0;
    let happyBoost = 0;

    if (itemType === 'wall_paint') {
      cost = WALL_PAINTS[itemId]?.cost || 0;
    } else if (itemType === 'wallpaper') {
      cost = WALLPAPERS[itemId]?.cost || 0;
    } else if (itemType === 'flooring') {
      cost = FLOOR_OPTIONS[itemId]?.cost || 0;
    } else {
      cost = ROOM_ITEMS[itemId]?.cost || 0;
      happyBoost = ROOM_ITEMS[itemId]?.happinessBoost || 0;
    }

    if (gameState.coins < cost) return;

    let newState = { ...gameState, coins: gameState.coins - cost };
    let roomUpdate = { ...newState.room };
    let petUpdate = { ...newState.pet };

    if (itemType === 'wall_paint') {
      roomUpdate.wallPaint = itemId;
    } else if (itemType === 'wallpaper') {
      roomUpdate.wallpaper = itemId;
    } else if (itemType === 'flooring') {
      roomUpdate.flooring = itemId;
    } else {
      // Room item — add to list, handle replacements
      const replacements = ROOM_ITEMS[itemId]?.replaces;
      let items = [...(roomUpdate.purchasedItems || [])];
      if (replacements && items.includes(replacements)) {
        items = items.filter(i => i !== replacements);
      }
      items.push(itemId);
      roomUpdate.purchasedItems = items;
    }

    if (happyBoost > 0) {
      petUpdate.happiness = Math.min(100, petUpdate.happiness + happyBoost);
    }

    newState.room = roomUpdate;
    newState.pet = petUpdate;
    setGameState(newState);
    saveState(newState);

    setBuyAnimation(itemId);
    setTimeout(() => setBuyAnimation(null), 600);
  };

  if (showShop) {
    return (
      <ShopScreen
        gameState={gameState}
        onBuy={handleBuy}
        onBuyRoom={handleBuyRoom}
        onBack={() => setShowShop(false)}
        buyAnimation={buyAnimation}
      />
    );
  }

  return (
    <div style={styles.app}>
      <StarBackground />
      <div style={{ ...styles.container, alignItems: 'center' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '12px 0',
        }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>🏠</button>
          <CoinDisplay coins={gameState.coins} />
        </div>

        {/* Meters */}
        <div style={{ width: '100%', maxWidth: '420px', margin: '10px 0' }}>
          <MeterBar label="🍖" value={gameState.pet.hunger} color="#ef4444" />
          <MeterBar label="💧" value={gameState.pet.thirst} color="#3b82f6" />
          <MeterBar label="😊" value={gameState.pet.happiness} color="#eab308" />
        </div>

        {/* Puppy Room (SVG Scene) */}
        <div style={{
          width: '100%', maxWidth: '420px', margin: '10px 0', position: 'relative',
        }}>
          {/* Floating hearts */}
          {hearts.map(h => (
            <div key={h.id} style={{
              position: 'absolute',
              top: '30%',
              left: `calc(50% + ${h.x}px)`,
              fontSize: '24px',
              animation: `floatUp 1.2s ease-out ${h.delay}s forwards`,
              opacity: 0,
              pointerEvents: 'none',
              zIndex: 20,
            }}>❤️</div>
          ))}
          <PuppyRoom room={gameState.room} pet={gameState.pet} onPet={handlePetPuppy} isPetting={isPetting} onDragEnd={handleDragEnd} />
          <div style={{ textAlign: 'center', fontSize: '13px', opacity: 0.5, marginTop: '4px' }}>
            Tap puppy to pet! Drag to rearrange! 👆
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button onClick={() => setShowShop(true)} style={bigBtnStyle('#f59e0b', '#d97706')}>
            🛒 Shop
          </button>
          <button onClick={onPlay} style={bigBtnStyle('#22c55e', '#16a34a')}>
            🎮 Play!
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Shop Screen ---
function ShopScreen({ gameState, onBuy, onBuyRoom, onBack, buyAnimation }) {
  const [tab, setTab] = useState('consumables');
  const purchased = gameState.pet.purchasedItems;
  const roomPurchased = gameState.room?.purchasedItems || [];

  const tabs = [
    { id: 'consumables', label: '🍖 Food' },
    { id: 'necessities', label: '🏠 Stuff' },
    { id: 'room', label: '🪑 Room' },
  ];

  // For pet shop items
  const getPetItems = () => {
    return Object.entries(SHOP_ITEMS).filter(([_, item]) => {
      if (tab === 'consumables') return item.category === 'consumables';
      if (tab === 'necessities') return item.category === 'necessities' || item.category === 'upgrades';
      return false;
    });
  };

  const canBuy = (itemId, item) => {
    if (gameState.coins < item.cost) return false;
    if (item.oneTime && purchased.includes(itemId)) return false;
    if (item.requires && !purchased.includes(item.requires)) return false;
    return true;
  };

  const getStatus = (itemId, item) => {
    if (item.oneTime && purchased.includes(itemId)) return 'purchased';
    if (item.requires && !purchased.includes(item.requires)) return 'locked';
    if (gameState.coins < item.cost) return 'cantAfford';
    return 'available';
  };

  // Room shop tab sub-section
  const [roomTab, setRoomTab] = useState('furniture');
  const roomTabs = [
    { id: 'furniture', label: '🪑' },
    { id: 'wall_decor', label: '🖼️' },
    { id: 'electronics', label: '📺' },
    { id: 'premium', label: '⭐' },
    { id: 'paint', label: '🎨' },
  ];

  const getRoomItems = () => {
    if (roomTab === 'paint') {
      // Combine wall paints, wallpapers, flooring
      const paintItems = Object.entries(WALL_PAINTS).map(([id, item]) => ({ id, ...item, type: 'wall_paint', isActive: gameState.room?.wallPaint === id }));
      const wpItems = Object.entries(WALLPAPERS).map(([id, item]) => ({ id, ...item, type: 'wallpaper', isActive: gameState.room?.wallpaper === id }));
      const floorItems = Object.entries(FLOOR_OPTIONS).map(([id, item]) => ({ id, ...item, type: 'flooring', isActive: gameState.room?.flooring === id }));
      return [...paintItems, ...wpItems, ...floorItems];
    }
    return Object.entries(ROOM_ITEMS).filter(([_, item]) => item.category === roomTab).map(([id, item]) => ({ id, ...item, type: 'room_item' }));
  };

  const isRoomItemPurchased = (item) => {
    if (item.type === 'wall_paint') return false; // Can always switch paint
    if (item.type === 'wallpaper') return false;
    if (item.type === 'flooring') return false;
    return roomPurchased.includes(item.id);
  };

  const canBuyRoomItem = (item) => {
    if (gameState.coins < item.cost) return false;
    if (item.type === 'wall_paint' && gameState.room?.wallPaint === item.id) return false; // Already active
    if (item.type === 'wallpaper' && gameState.room?.wallpaper === item.id) return false;
    if (item.type === 'flooring' && gameState.room?.flooring === item.id) return false;
    if (item.type === 'room_item') {
      if (roomPurchased.includes(item.id)) return false;
      if (item.requires && !roomPurchased.includes(item.requires)) return false;
    }
    return true;
  };

  const getRoomItemStatus = (item) => {
    if (item.type === 'room_item' && roomPurchased.includes(item.id)) return 'purchased';
    if (item.isActive) return 'active';
    if (item.requires && !roomPurchased.includes(item.requires)) return 'locked';
    if (gameState.coins < item.cost) return 'cantAfford';
    return 'available';
  };

  const shopItemRow = (icon, name, effectText, status, isBuying, cost, onBuyFn, imgSrc) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: isBuying ? 'rgba(34,197,94,0.3)' : (status === 'purchased' || status === 'active') ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '12px 16px',
      border: (status === 'purchased' || status === 'active') ? '2px solid rgba(34,197,94,0.3)' : '2px solid rgba(255,255,255,0.08)',
      opacity: status === 'cantAfford' || status === 'locked' ? 0.5 : 1,
      transition: 'all 0.3s',
    }}>
      <span style={{ fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
        {status === 'locked' ? '🔒' : (
          imgSrc ? <img src={imgSrc} alt={name} style={{ width: 32, height: 32, objectFit: 'contain' }} /> : icon
        )}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '15px' }}>{name}</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>{effectText}</div>
      </div>
      {status === 'purchased' ? (
        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '18px' }}>✅</span>
      ) : status === 'active' ? (
        <span style={{ color: '#22c55e', fontWeight: 600, fontSize: '12px' }}>Active</span>
      ) : (
        <button
          onClick={onBuyFn}
          disabled={status !== 'available'}
          style={{
            padding: '8px 14px',
            background: status === 'available' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(100,100,100,0.3)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            cursor: status === 'available' ? 'pointer' : 'default',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          🪙 {cost}
        </button>
      )}
    </div>
  );

  return (
    <div style={styles.app}>
      <StarBackground />
      <div style={{ ...styles.container, alignItems: 'center' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '12px 0',
        }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>←</button>
          <h2 style={{ fontFamily: "'Fredoka One', sans-serif", fontSize: '24px', margin: 0, color: '#f59e0b' }}>🛒 Shop</h2>
          <CoinDisplay coins={gameState.coins} />
        </div>

        {/* Main Tabs */}
        <div style={{ display: 'flex', gap: '5px', margin: '10px 0', width: '100%', maxWidth: '500px' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: '10px 6px',
                background: tab === t.id ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)',
                border: tab === t.id ? '2px solid #f59e0b' : '2px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Room sub-tabs */}
        {tab === 'room' && (
          <div style={{ display: 'flex', gap: '4px', margin: '0 0 10px', width: '100%', maxWidth: '500px' }}>
            {roomTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setRoomTab(t.id)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  background: roomTab === t.id ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.03)',
                  border: roomTab === t.id ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >{t.label}</button>
            ))}
          </div>
        )}

        {/* Items */}
        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px', overflowY: 'auto', maxHeight: '55vh' }}>
          {tab !== 'room' ? (
            // Pet shop items
            getPetItems().map(([itemId, item]) => {
              const status = getStatus(itemId, item);
              const isBuying = buyAnimation === itemId;
              return (
                <div key={itemId}>
                  {shopItemRow(
                    item.icon,
                    item.name,
                    status === 'locked' ? `Need ${SHOP_ITEMS[item.requires]?.icon} ${SHOP_ITEMS[item.requires]?.name} first!` : item.effect,
                    status,
                    isBuying,
                    item.cost,
                    () => canBuy(itemId, item) && onBuy(itemId),
                    item.img
                  )}
                </div>
              );
            })
          ) : (
            // Room shop items
            getRoomItems().map((item) => {
              const status = getRoomItemStatus(item);
              const isBuying = buyAnimation === item.id;
              const effectText = item.type === 'room_item'
                ? `+${item.happinessBoost}% 😊${item.requires ? ` (Need ${ROOM_ITEMS[item.requires]?.icon || ''})` : ''}`
                : item.type === 'wall_paint' ? '🎨 Wall color'
                : item.type === 'wallpaper' ? '🧱 Wall pattern'
                : '🏠 Floor style';
              return (
                <div key={item.id}>
                  {shopItemRow(
                    item.icon,
                    item.name,
                    status === 'locked' ? `Need ${ROOM_ITEMS[item.requires]?.icon} first!` : effectText,
                    status,
                    isBuying,
                    item.cost,
                    () => canBuyRoomItem(item) && onBuyRoom(item.id, item.type),
                    item.img
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CSS ANIMATIONS
// ============================================================================

const globalCSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; overflow-x: hidden; background: #1a1a2e; }

  @keyframes twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  @keyframes slashIn {
    0% { opacity: 0; transform: rotate(-15deg) scaleX(0); }
    100% { opacity: 1; transform: rotate(-15deg) scaleX(1); }
  }

  @keyframes splitLeft {
    0% { transform: translate(0, 0); opacity: 0.8; }
    100% { transform: translate(-60px, 40px); opacity: 0; }
  }

  @keyframes splitRight {
    0% { transform: translate(0, 0); opacity: 0.8; }
    100% { transform: translate(60px, 40px); opacity: 0; }
  }

  @keyframes splitLeftSpin {
    0% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
    100% { transform: translate(-80px, 50px) rotate(-180deg); opacity: 0; }
  }

  @keyframes splitRightSpin {
    0% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
    100% { transform: translate(80px, 50px) rotate(180deg); opacity: 0; }
  }

  @keyframes flashFade {
    0% { opacity: 0.15; }
    100% { opacity: 0; }
  }

  @keyframes fadeUp {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
    50% { opacity: 1; transform: translate(-50%, -70%) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -100%) scale(1); }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(-10deg); }
    40% { transform: rotate(10deg); }
    60% { transform: rotate(-8deg); }
    80% { transform: rotate(8deg); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes floatUp {
    0% { opacity: 0; transform: translateY(0) scale(0.5); }
    20% { opacity: 1; transform: translateY(-10px) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
  }

  @keyframes shiver {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-1px); }
    75% { transform: translateX(1px); }
  }

  @keyframes fairyPulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  @keyframes lavaFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  button:active {
    transform: scale(0.95) !important;
  }
`;

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [gameState, setGameState] = useState(loadState);
  const [screen, setScreen] = useState('title');
  const [currentMode, setCurrentMode] = useState(null);
  const [currentWave, setCurrentWave] = useState(1);
  const [waveStats, setWaveStats] = useState(null);
  const [gameKey, setGameKey] = useState(0);

  // Inject global CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalCSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSelectMode = (modeId) => {
    setCurrentMode(modeId);
    setCurrentWave(gameState.progress[modeId].currentWave);
    setGameKey(prev => prev + 1);
    setScreen('gameplay');
  };

  const handleWaveComplete = (stats) => {
    setWaveStats(stats);
    setScreen('waveComplete');
  };

  const handleNextWave = () => {
    setCurrentWave(prev => prev + 1);
    setGameKey(prev => prev + 1);
    setScreen('gameplay');
  };

  const handleVisitPuppy = () => {
    setScreen('puppy');
  };

  const handleMenu = () => {
    setScreen('title');
  };

  if (screen === 'title') {
    return (
      <div style={styles.app}>
        <StarBackground />
        <TitleScreen
          gameState={gameState}
          onSelectMode={handleSelectMode}
          onVisitPuppy={handleVisitPuppy}
        />
      </div>
    );
  }

  if (screen === 'gameplay') {
    return (
      <GameplayScreen
        key={gameKey}
        mode={currentMode}
        wave={currentWave}
        gameState={gameState}
        setGameState={setGameState}
        onWaveComplete={handleWaveComplete}
        onBack={handleMenu}
      />
    );
  }

  if (screen === 'waveComplete') {
    return (
      <WaveCompleteScreen
        stats={waveStats}
        gameState={gameState}
        onNextWave={handleNextWave}
        onVisitPuppy={handleVisitPuppy}
        onMenu={handleMenu}
      />
    );
  }

  if (screen === 'puppy') {
    return (
      <PuppyHomeScreen
        gameState={gameState}
        setGameState={setGameState}
        onBack={handleMenu}
        onPlay={() => setScreen('title')}
      />
    );
  }

  return null;
}
