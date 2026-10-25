/* Shared, dependency-free rules for the map, catalogue and Node tests. */
(function(root) {
  'use strict';
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function projectYear(p) {
    if (p.status === 'unknown' || p.status === 'mixed') return null;
    const years = (p.poss || '').match(/20\d\d/g);
    return years ? Math.max(...years.map(Number)) : null;
  }
  function completionBucket(p) {
    if (p.status === 'ready') return 'ready';
    if (p.status === 'mixed' || p.status === 'unknown') return 'unknown';
    const year = projectYear(p);
    if (year == null) return 'unknown';
    if (year <= 2026) return 'target26';
    return year <= 2028 ? 'y2728' : year <= 2031 ? 'y2931' : 'y32';
  }
  function dateCompare(a, b, descending = false) {
    const x = projectYear(a), y = projectYear(b);
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    return descending ? y-x : x-y;
  }
  function bandOverlap(selected, min, max) {
    if (min == null) return selected.includes('unknown');
    const ranges = {lo:[0,3],mid:[3,6],hi:[6,Infinity]};
    return selected.some(k => ranges[k] && ranges[k][0] <= (max == null ? Infinity : max) && min <= ranges[k][1]);
  }
  function metroStage(line) {
    if (line.status === 'op') return 'op';
    if (line.status === 'uc') return 'uc';
    return /^(Orange|Grey) Line/.test(line.name) ? 'approved' : 'proposed';
  }
  function nearestStations(p, lines, distance) {
    const best = {};
    lines.forEach(line => line.pts.forEach(station => {
      const key = metroStage(line), d = distance(p.lat, p.lng, station[1], station[2]);
      if (!best[key] || d < best[key].d) best[key] = {d,station:station[0],line:line.name};
    }));
    return best;
  }
  function validPin(p) {
    return Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.lat > 12.6 && p.lat < 13.5 && p.lng > 77.2 && p.lng < 78.1;
  }
  const api = {escapeHtml,projectYear,completionBucket,dateCompare,bandOverlap,metroStage,nearestStations,validPin};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PropertyUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
