import { HEALTH_MAX_HIT_POINTS, SKILL_POINTS } from "../constants/battle.js";

export const createDefaultFighterState = (id) => ({
id, 
score: 100,
battles: 0,
wins: 0,
skillNumber: 1,
resetSkillBar: false,
hitPoints: HEALTH_MAX_HIT_POINTS,
skillPoints: SKILL_POINTS,
superAcivated: false,
});