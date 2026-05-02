// theme.js — shared color tokens for light/dark
const LIGHT = {
  bg:        '#ffffff',
  bgPage:    '#f8fafc',
  sidebar:   '#f8fafc',
  card:      '#ffffff',
  border:    '#e2e8f0',
  fg:        '#0f172a',
  fg2:       '#64748b',
  fg3:       '#94a3b8',
  muted:     '#f1f5f9',
  primary:   '#0f172a',
  primaryFg: '#f8fafc',
  input:     '#ffffff',
  hover:     '#f1f5f9',
};

const DARK = {
  bg:        '#0f172a',
  bgPage:    '#0f172a',
  sidebar:   '#1e293b',
  card:      '#1e293b',
  border:    '#334155',
  fg:        '#f8fafc',
  fg2:       '#94a3b8',
  fg3:       '#64748b',
  muted:     '#1e293b',
  primary:   '#f8fafc',
  primaryFg: '#0f172a',
  input:     '#1e293b',
  hover:     '#334155',
};

Object.assign(window, { LIGHT, DARK });
