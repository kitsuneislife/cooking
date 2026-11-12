// Efeitos sonoros do jogo: caminhos em public/sfx/, sem ".wav".
// Cada entrada é uma lista de variações; um toque sorteia uma delas (ver src/game/sound.js).
export const SFX = {
  // interface
  pick: ["cut/quick_place_cut_1", "cut/quick_place_cut_2"],
  good: ["ui/sparkle_light"],
  combo: ["ui/bg_collab_combo"],
  bad: ["ui/beep"],
  fail: ["ui/down"],
  go: ["ui/bell_short"],
  start: ["ui/celebrate_sparkle_light"],
  ready: ["ui/bell_short"],
  stamp: {
    perfect: ["ui/celebrate_medium"],
    great: ["ui/celebrate_small"],
    good: ["ui/celebrate_light"],
    oops: ["ui/down"],
  },
  reveal: ["ui/sparkle_medium"],
  win: ["ui/celebrate_medium"],
  lose: ["ui/defeat_lose"],
  swish: ["prep/whoosh_generic"],

  // faca: cada alimento tem o seu som de corte
  chop: {
    garlic: ["cut/chop_hard_food"],
    ginger: ["cut/chop_hard_food"],
    onion: ["cut/chop_onion"],
    cilantro: ["cut/chop_green_onion"],
    jalapeno: ["cut/chop_green_pepper"],
    mango: ["cut/chop_soft_food"],
    default: ["cut/knife_cut", "cut/chop_soft_food"],
  },
  slice: {
    beef: ["cut/cut_meat_tendon", "cut/cut_split_hard_food"],
    chicken: ["cut/cut_split_soft_food", "cut/cut_split_vienna_sausage"],
    default: ["cut/cut_split_soft_food"],
  },
  wheel: ["cut/slide_cut_1", "cut/slide_cut_2", "cut/slide_cut_3"],

  // o que cai em algum lugar
  plop: {
    default: ["prep/drop_generic"],
    splat: ["prep/drop_splat_1", "prep/drop_splat_2"],
    place: ["cut/quick_place_cut_1", "cut/quick_place_cut_2", "prep/shape_form"],
    rice: ["prep/shape_onigiri"],
    ice: ["prep/measure_rice_3"],
    sprinkle: ["prep/add_sprinkle"],
    dip: ["prep/add_water"],
    lid: ["cook/pot_lid_on"],
  },

  // bancada
  whisk: ["prep/beat_egg"],
  mix: { bowl: ["prep/mix_bowl"], glass: ["prep/mix_solids"] },
  spread: { default: ["prep/jelly_squish"], pizza: ["prep/draw_on_food"] },
  roll: ["prep/dough_roll_out"],
  pound: ["prep/mash_potato", "prep/pound_mochi_1", "prep/pound_mochi_2"],
  shake: {
    seasoning: ["prep/shaker_1", "prep/shaker_2"],
    sieve: ["prep/add_flour"],
    default: ["prep/add_sprinkle"],
  },
  pour: ["prep/pour_water"],
  crush: ["cut/grate_1", "cut/grate_2", "cut/grate_3"],

  // fogão, forno e geladeira
  sear: { medium: ["cook/sizzle_oneshot_medium"], high: ["cook/sizzle_oneshot_high"] },
  toss: ["cook/flip_frying_pan"],
  spatula: ["cook/stir_fry_spatula"],
  smoke: ["cook/smoke_puff"],
  switch: ["cook/stove_switch"],
  open: ["kitchen/generic_open"],
  close: ["kitchen/generic_close", "kitchen/generic_close_2"],
  done: { hot: ["ui/bell_dish_ready"], cold: ["ui/bell_short"] },
  tick: ["kitchen/clock_tick", "kitchen/clock_tock"],
};

// Sons contínuos: cada um é uma pilha de camadas, da mais fraca para a mais forte.
export const LOOPS = {
  sizzle: ["cook/loop_sizzle_low", "cook/loop_sizzle_medium", "cook/loop_sizzle_high"],
  grill: ["cook/charcoal_grill_1", "cook/charcoal_grill_2", "cook/charcoal_grill_3"],
  bake: ["cook/loop_butter_melting"],
  fill: ["cook/loop_water_filling"],
  pot: ["cook/loop_water_into_pot"],
  overflow: ["cook/loop_water_overflow"],
};

// Volume de cada camada para uma intensidade de 0 a 1: só as duas vizinhas soam,
// trocando com potência constante; com uma camada só, a intensidade é o volume.
export function layerMix(level, layers) {
  const v = Math.max(0, Math.min(1, level));
  if (layers === 1) return [v];
  if (v === 0) return Array(layers).fill(0);
  const at = v * (layers - 1), loud = 0.4 + 0.6 * v;
  return Array.from({ length: layers }, (_, i) => Math.sqrt(Math.max(0, 1 - Math.abs(at - i))) * loud);
}

// Todo caminho usado acima, sem repetir (o som carrega todos de uma vez).
export const allSfx = () => [...new Set([SFX, LOOPS].flatMap(function walk(o) {
  return Array.isArray(o) ? o : Object.values(o).flatMap(walk);
}))];
