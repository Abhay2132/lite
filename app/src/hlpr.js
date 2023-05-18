export const wait = n => new Promise(r=> setTimeout(r, n||0));
export const log = console.log;
export const $ = q=> document.querySelector(q);
export const $$ = q => document.querySelectorAll(q);