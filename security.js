(function () {
  'use strict';

  var REDIRECT = 'main.html';
  var THRESHOLD = 160; // порог разницы размеров окна для docked-devtools

  function boom() {
    // уводим на main.html, не оставляя 2.html в истории и не давая дорисоваться
    try { window.stop(); } catch (e) {}
    try { document.documentElement.innerHTML = ''; } catch (e) {}
    location.replace(REDIRECT);
  }

  // Метод 1. Разница внешних/внутренних размеров окна (пристыкованные devtools).
  function sizeTrap() {
    var dw = window.outerWidth - window.innerWidth;
    var dh = window.outerHeight - window.innerHeight;
    if (dw > THRESHOLD || dh > THRESHOLD) boom();
  }

  // Метод 2. Геттер-приманка: console читает свойства объекта только при открытой консоли/devtools.
  // Работает и для отстыкованных (отдельным окном) devtools, где sizeTrap бессилен.
  function consoleTrap() {
    var fired = false;
    var bait = {};
    Object.defineProperty(bait, 'id', {
      get: function () { fired = true; return 'x'; }
    });
    console.log(bait);
    console.clear();
    if (fired) boom();
  }

  // Метод 3. Замер времени форматирования объекта в консоли (доп. подстраховка,
  // не использует `debugger` — не ставит скрипт на паузу и не подвешивает страницу).
  function timingTrap() {
    var t0 = performance.now();
    console.log('%c', 'padding:0');
    console.clear();
    if (performance.now() - t0 > 20) boom();
  }

  function check() {
    sizeTrap();
    consoleTrap();
    timingTrap();
  }

  // Прогон сразу (до отрисовки) — ловит случай "перешёл на 2.html с уже открытыми devtools".
  check();
  // И периодически — ловит открытие devtools уже на странице.
  setInterval(check, 500);
})();
