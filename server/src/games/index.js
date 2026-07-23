// games/index.js — registry of playable games. GameManager looks games up here.
// This repo ships one U.S. History Unit 3 game: Two Rebellions.

import usTwoRebellions from './usTwoRebellions.js';

export const GAMES = {
  [usTwoRebellions.id]: usTwoRebellions,
};

export function getGame(id) {
  return GAMES[id] || null;
}
