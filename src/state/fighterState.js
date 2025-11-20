import { HEALTH_MAX_HIT_POINTS, SKILL_POINTS } from "../constants/battle.js";

export const createDefaultFighterState = (id) => ({
id, 
score: 100,
battles: 0,
wins: 0,
status: 'normal',
skillNumber: 3,
skillConsumed: true,
resetSkillBar: false,
hitPoints: HEALTH_MAX_HIT_POINTS,
skillPoints: SKILL_POINTS,
superAcivated: false,
sprite: 0,
dead: "alive",
hyperSprite: 0,
 statusExpiresAt: 0,
});