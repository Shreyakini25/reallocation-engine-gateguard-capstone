/* ════════════════════════════════════════════════════════════════════
   charts.js — D3 v7 chart + icon factories for swe-to-ai-engineer
   Dark palette. Animated on slide entry. Reduced-motion aware.
   ════════════════════════════════════════════════════════════════════ */

const FACTORIES = {};

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function cssVar(name, fb) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fb;
}
const C = {
  get CYAN()  { return cssVar("--brand-cyan", "#00BCD4"); },
  get BLUE()  { return cssVar("--brand-blue", "#1565C0"); },
  GREEN: "#69F0AE", AMBER: "#FFB74D", RED: "#EF9A9A", ORANGE: "#FF7043",
  FG2: "rgba(255,255,255,0.7)", AXIS: "rgba(255,255,255,0.2)", GRID: "rgba(255,255,255,0.06)",
  FONT: '"Exo 2", sans-serif',
};

/* ── Title-screen classification horizontal bars ──────────────────── */
FACTORIES["title-screen-bars"] = function (root, opts = {}) {
  const animate = opts.animate && !reduceMotion();
  const W = 1680, H = 200, M = { t: 8, r: 160, b: 8, l: 280 };
  const svg = d3.select(root).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("class", "chart-svg")
    .style("background", "transparent");

  const data = [
    { label: "Practitioner",    count: 5, color: C.CYAN,            note: "proceed to liveness gate" },
    { label: "Researcher-Only", count: 3, color: C.AMBER,           note: "stopped at title screen" },
    { label: "Hybrid",          count: 1, color: "#1E88E5",         note: "manual review required" },
    { label: "No-Data",         count: 1, color: "rgba(255,255,255,0.25)", note: "public company — no Form D" },
  ];

  const x = d3.scaleLinear().domain([0, 10]).range([M.l, W - M.r]);
  const y = d3.scaleBand().domain(data.map(d => d.label)).range([M.t, H - M.b]).padding(0.28);

  // background track (full 10)
  svg.append("g").selectAll("rect.bg").data(data).join("rect").attr("class", "bg")
    .attr("x", M.l).attr("y", d => y(d.label)).attr("width", x(10) - M.l)
    .attr("height", y.bandwidth()).attr("rx", 5).attr("fill", "rgba(255,255,255,0.04)");

  // category labels
  svg.append("g").selectAll("text.cat").data(data).join("text").attr("class", "cat")
    .attr("x", M.l - 18).attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("text-anchor", "end").attr("dominant-baseline", "central")
    .attr("fill", "rgba(255,255,255,0.85)").attr("font-family", C.FONT).attr("font-size", 20)
    .attr("font-weight", 700).text(d => d.label);

  // bars
  const bars = svg.append("g").selectAll("rect.bar").data(data).join("rect").attr("class", "bar")
    .attr("x", M.l).attr("y", d => y(d.label)).attr("height", y.bandwidth())
    .attr("rx", 5).attr("fill", d => d.color).attr("opacity", d => d.label === "No-Data" ? 0.6 : 1);
  if (animate) {
    bars.attr("width", 0).transition().delay((d, i) => i * 80).duration(500)
      .ease(d3.easeCubicOut).attr("width", d => x(d.count) - M.l);
  } else {
    bars.attr("width", d => x(d.count) - M.l);
  }

  // count + note labels
  const labs = svg.append("g").selectAll("g.vlab").data(data).join("g").attr("class", "vlab");
  labs.append("text").attr("class", "count")
    .attr("x", d => x(d.count) + 14).attr("y", d => y(d.label) + y.bandwidth() / 2 - 9)
    .attr("dominant-baseline", "central").attr("font-family", '"Share Tech Mono", monospace')
    .attr("font-size", 22).attr("font-weight", 700).attr("fill", d => d.color)
    .text(d => `${d.count} of 10`);
  labs.append("text").attr("class", "note")
    .attr("x", d => x(d.count) + 14).attr("y", d => y(d.label) + y.bandwidth() / 2 + 14)
    .attr("dominant-baseline", "central").attr("font-family", C.FONT)
    .attr("font-size", 16).attr("fill", "rgba(255,255,255,0.5)")
    .text(d => d.note);
  if (animate) labs.attr("opacity", 0).transition().delay(800).duration(280).attr("opacity", 1);
};

/* ── Approval scatter — 5 practitioner companies ─────────────────── */
FACTORIES["approval-scatter"] = function (root, opts = {}) {
  const animate = opts.animate && !reduceMotion();
  const W = 1680, H = 360, M = { t: 30, r: 100, b: 56, l: 90 };
  const svg = d3.select(root).append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`).attr("class", "chart-svg");

  const data = [
    { name: "Attentive Mobile",  rate: 100.0, count:  96, lowN: false, scored: false },
    { name: "Cohere Health",     rate:  98.1, count: 104, lowN: false, scored: true  },
    { name: "Kensho",            rate: 100.0, count:  40, lowN: false, scored: false },
    { name: "Moloco",            rate:  99.0, count: 200, lowN: false, scored: false },
    { name: "Zoom (N=2)",        rate: 100.0, count:   2, lowN: true,  scored: false },
  ];

  // x = Total Approvals  y = Approval Rate
  const x = d3.scaleLinear().domain([0, 220]).range([M.l, W - M.r]);
  const y = d3.scaleLinear().domain([95, 101]).range([H - M.b, M.t]);
  const r = d3.scaleSqrt().domain([0, 220]).range([3, 52]);

  // grid
  svg.append("g").selectAll("line.hg").data(y.ticks(4)).join("line").attr("class", "hg")
    .attr("x1", M.l).attr("x2", W - M.r).attr("y1", d => y(d)).attr("y2", d => y(d)).attr("stroke", C.GRID);
  svg.append("g").selectAll("line.vg").data(x.ticks(5)).join("line").attr("class", "vg")
    .attr("x1", d => x(d)).attr("x2", d => x(d)).attr("y1", M.t).attr("y2", H - M.b).attr("stroke", C.GRID);

  // axes
  svg.append("g").selectAll("text.yt").data(y.ticks(4)).join("text").attr("class", "yt")
    .attr("x", M.l - 12).attr("y", d => y(d)).attr("text-anchor", "end")
    .attr("dominant-baseline", "central").attr("fill", C.FG2)
    .attr("font-family", C.FONT).attr("font-size", 17).text(d => d + "%");
  svg.append("g").selectAll("text.xt").data(x.ticks(5)).join("text").attr("class", "xt")
    .attr("x", d => x(d)).attr("y", H - M.b + 24).attr("text-anchor", "middle")
    .attr("fill", C.FG2).attr("font-family", C.FONT).attr("font-size", 17).text(d => d);

  // axis labels
  svg.append("text").attr("x", (M.l + W - M.r) / 2).attr("y", H - 10)
    .attr("text-anchor", "middle").attr("fill", C.FG2)
    .attr("font-family", C.FONT).attr("font-size", 16).text("Total H-1B Approvals →");
  svg.append("text").attr("transform", `translate(24,${(M.t + H - M.b) / 2}) rotate(-90)`)
    .attr("text-anchor", "middle").attr("fill", C.FG2)
    .attr("font-family", C.FONT).attr("font-size", 16).text("Approval Rate % →");

  // dots
  const g = svg.append("g").selectAll("g.dot").data(data).join("g").attr("class", "dot");

  function dotColor(d) {
    if (d.scored) return C.GREEN;
    if (d.lowN)   return C.AMBER;
    return C.CYAN;
  }

  const circ = g.append("circle")
    .attr("cx", d => x(d.count)).attr("cy", d => y(d.rate))
    .attr("fill", d => dotColor(d)).attr("fill-opacity", d => d.scored ? 0.3 : 0.18)
    .attr("stroke", d => dotColor(d))
    .attr("stroke-width", d => d.scored ? 3 : 2);
  if (animate) {
    circ.attr("r", 0).transition().delay((d, i) => 200 + i * 120).duration(500)
      .ease(d3.easeCubicOut).attr("r", d => r(d.count));
  } else { circ.attr("r", d => r(d.count)); }

  // labels: position above dot, except Zoom (too small — label right)
  const labs = g.append("text")
    .attr("x", d => d.lowN ? x(d.count) + 10 : x(d.count))
    .attr("y", d => d.lowN ? y(d.rate) : y(d.rate) - r(d.count) - 10)
    .attr("text-anchor", d => d.lowN ? "start" : "middle")
    .attr("fill", d => dotColor(d)).attr("font-family", C.FONT)
    .attr("font-weight", 700).attr("font-size", 18)
    .text(d => d.scored ? `${d.name} ★ SCORED` : d.name);
  if (animate) labs.attr("opacity", 0).transition().delay(900).duration(280).attr("opacity", 1);

  // N=2 annotation for Zoom
  svg.append("text")
    .attr("x", x(2) + 10).attr("y", y(100) + 26)
    .attr("fill", C.AMBER).attr("font-family", C.FONT).attr("font-size", 15)
    .attr("font-style", "italic").text("N=2 → rate unreliable");
};

/* ── Pipeline flow — 5 nodes, liveness marked as gate ────────────── */
FACTORIES["pipeline-flow"] = function (root, opts = {}) {
  const animate = opts.animate && !reduceMotion();
  const W = 1680, H = 130;
  const svg = d3.select(root).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("class", "chart-svg");

  const n = 5;
  const pad = 110;
  const gap = (W - pad * 2) / (n - 1);
  const GATE_I = 3; // D = Liveness Gate

  const nodeData = [
    { letter: "A", label: "Provenance",   sub: "validate-h1b-join" },
    { letter: "B", label: "Title Screen", sub: "CSV lookup" },
    { letter: "C", label: "Funding",      sub: "recency flag" },
    { letter: "D", label: "Liveness",     sub: "GATE ⛔ hard stop" },
    { letter: "E", label: "Score",        sub: "role-scorer.mjs" },
  ].map((d, i) => ({ ...d, x: pad + i * gap, y: 46, isGate: i === GATE_I }));

  // connector lines
  for (let i = 0; i < n - 1; i++) {
    const a = nodeData[i], b = nodeData[i + 1];
    const lineColor = i === GATE_I - 1 ? C.ORANGE : C.CYAN;
    const path = svg.append("line")
      .attr("x1", a.x + 28).attr("y1", a.y)
      .attr("x2", a.x + 28).attr("y2", a.y)
      .attr("stroke", lineColor).attr("stroke-width", 2.5);
    if (animate) {
      path.transition().delay(i * 200 + 300).duration(400).ease(d3.easeCubicOut)
        .attr("x2", b.x - 28).attr("y2", b.y);
    } else { path.attr("x2", b.x - 28).attr("y2", b.y); }
  }

  // nodes
  const gNodes = svg.append("g").selectAll("g.nd").data(nodeData).join("g").attr("class", "nd");

  const circ = gNodes.append("circle")
    .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 26)
    .attr("fill", d => d.isGate ? "#B71C1C" : C.BLUE)
    .attr("stroke", d => d.isGate ? C.ORANGE : C.CYAN)
    .attr("stroke-width", d => d.isGate ? 3 : 2);
  if (animate) {
    circ.attr("opacity", 0).transition().delay((d, i) => i * 80).duration(380).attr("opacity", 1);
  }

  gNodes.append("text")
    .attr("x", d => d.x).attr("y", d => d.y).attr("text-anchor", "middle")
    .attr("dominant-baseline", "central").attr("fill", "#fff")
    .attr("font-family", '"Orbitron", sans-serif').attr("font-weight", 700).attr("font-size", 20)
    .text(d => d.letter);

  // main label below node
  gNodes.append("text")
    .attr("x", d => d.x).attr("y", d => d.y + 40).attr("text-anchor", "middle")
    .attr("fill", d => d.isGate ? C.ORANGE : "rgba(255,255,255,0.85)")
    .attr("font-family", C.FONT).attr("font-size", 17)
    .attr("font-weight", d => d.isGate ? 700 : 400)
    .text(d => d.label);

  // sub-label
  gNodes.append("text")
    .attr("x", d => d.x).attr("y", d => d.y + 60).attr("text-anchor", "middle")
    .attr("fill", d => d.isGate ? "rgba(255,112,67,0.8)" : "rgba(255,255,255,0.4)")
    .attr("font-family", '"Share Tech Mono", monospace').attr("font-size", 14)
    .text(d => d.sub);
};

/* ── Mini icon factories ──────────────────────────────────────────── */
function iconSvg(root) {
  return d3.select(root).append("svg").attr("viewBox", "0 0 52 52").attr("class", "chart-svg")
    .style("width", "52px").style("height", "52px");
}
function fadeIcon(g, i, animate) {
  if (animate) g.attr("opacity", 0).transition().delay(i * 120).duration(350).attr("opacity", 1);
}

FACTORIES["icon-soc"] = function (root, o = {}) {
  const s = iconSvg(root), g = s.append("g").attr("stroke", C.CYAN).attr("stroke-width", 2.4).attr("fill", "none");
  g.append("rect").attr("x", 8).attr("y", 8).attr("width", 24).attr("height", 24).attr("rx", 3);
  g.append("line").attr("x1", 8).attr("y1", 16).attr("x2", 32).attr("y2", 16);
  g.append("line").attr("x1", 8).attr("y1", 24).attr("x2", 32).attr("y2", 24);
  g.append("line").attr("x1", 16).attr("y1", 8).attr("x2", 16).attr("y2", 32);
  g.append("circle").attr("cx", 34).attr("cy", 34).attr("r", 8);
  g.append("line").attr("x1", 40).attr("y1", 40).attr("x2", 46).attr("y2", 46).attr("stroke-width", 3);
  fadeIcon(g, o.i || 0, o.animate && !reduceMotion());
};

FACTORIES["icon-pivot"] = function (root, o = {}) {
  const s = iconSvg(root), g = s.append("g").attr("stroke", C.CYAN).attr("stroke-width", 2.4).attr("fill", "none");
  g.append("circle").attr("cx", 26).attr("cy", 26).attr("r", 18);
  g.append("path").attr("d", "M26 14 L31 26 L26 38 L21 26 Z").attr("fill", C.CYAN).attr("stroke", "none");
  fadeIcon(g, o.i || 0, o.animate && !reduceMotion());
};

FACTORIES["icon-sponsor"] = function (root, o = {}) {
  const s = iconSvg(root), g = s.append("g").attr("stroke", C.CYAN).attr("stroke-width", 2.4).attr("fill", "none");
  g.append("path").attr("d", "M26 8 L42 14 V26 C42 36 34 42 26 45 C18 42 10 36 10 26 V14 Z");
  g.append("path").attr("d", "M19 26 L24 32 L34 20").attr("stroke-width", 3);
  fadeIcon(g, o.i || 0, o.animate && !reduceMotion());
};

FACTORIES["icon-ats"] = function (root, o = {}) {
  const s = iconSvg(root), g = s.append("g").attr("stroke", C.CYAN).attr("stroke-width", 2.4).attr("fill", "none");
  g.append("circle").attr("cx", 26).attr("cy", 36).attr("r", 4).attr("fill", C.CYAN).attr("stroke", "none");
  g.append("path").attr("d", "M16 30 a14 14 0 0 1 20 0");
  g.append("path").attr("d", "M10 24 a22 22 0 0 1 32 0");
  fadeIcon(g, o.i || 0, o.animate && !reduceMotion());
};

FACTORIES["icon-salary"] = function (root, o = {}) {
  const s = iconSvg(root), g = s.append("g").attr("stroke", C.CYAN).attr("stroke-width", 2.4).attr("fill", "none");
  g.append("line").attr("x1", 26).attr("y1", 8).attr("x2", 26).attr("y2", 40);
  g.append("line").attr("x1", 12).attr("y1", 14).attr("x2", 40).attr("y2", 14);
  g.append("path").attr("d", "M12 14 L7 26 H17 Z");
  g.append("path").attr("d", "M40 14 L35 26 H45 Z");
  g.append("line").attr("x1", 16).attr("y1", 42).attr("x2", 36).attr("y2", 42).attr("stroke-width", 3);
  fadeIcon(g, o.i || 0, o.animate && !reduceMotion());
};

FACTORIES["icon-calendar"] = function (root, o = {}) {
  const s = iconSvg(root), g = s.append("g").attr("stroke", "#fff").attr("stroke-width", 2.4).attr("fill", "none");
  g.append("rect").attr("x", 9).attr("y", 12).attr("width", 34).attr("height", 30).attr("rx", 3);
  g.append("line").attr("x1", 9).attr("y1", 20).attr("x2", 43).attr("y2", 20);
  g.append("line").attr("x1", 18).attr("y1", 8).attr("x2", 18).attr("y2", 14);
  g.append("line").attr("x1", 34).attr("y1", 8).attr("x2", 34).attr("y2", 14);
  fadeIcon(g, o.i || 0, o.animate && !reduceMotion());
};

FACTORIES["icon-radar"] = function (root, o = {}) {
  const s = iconSvg(root), g = s.append("g").attr("stroke", "#fff").attr("stroke-width", 2.4).attr("fill", "none");
  g.append("circle").attr("cx", 26).attr("cy", 26).attr("r", 16);
  g.append("circle").attr("cx", 26).attr("cy", 26).attr("r", 8);
  g.append("circle").attr("cx", 26).attr("cy", 26).attr("r", 2).attr("fill", "#fff");
  fadeIcon(g, o.i || 0, o.animate && !reduceMotion());
};

FACTORIES["icon-brain"] = function (root, o = {}) {
  const s = iconSvg(root), g = s.append("g").attr("stroke", "#fff").attr("stroke-width", 2.4).attr("fill", "none");
  g.append("circle").attr("cx", 18).attr("cy", 26).attr("r", 4);
  g.append("circle").attr("cx", 34).attr("cy", 18).attr("r", 4);
  g.append("circle").attr("cx", 34).attr("cy", 34).attr("r", 4);
  g.append("line").attr("x1", 22).attr("y1", 26).attr("x2", 30).attr("y2", 18);
  g.append("line").attr("x1", 22).attr("y1", 26).attr("x2", 30).attr("y2", 34);
  fadeIcon(g, o.i || 0, o.animate && !reduceMotion());
};

/* ════════════════════════════════════════════════════════════════════
   MOUNT WIRING
   ════════════════════════════════════════════════════════════════════ */
function mountIn(slide, animate) {
  if (!slide) return;
  slide.querySelectorAll("[data-chart]").forEach((el) => {
    const slug = el.getAttribute("data-chart");
    if (!FACTORIES[slug]) return;
    el.innerHTML = "";
    const opts = { animate };
    if (el.dataset.iconIndex) opts.i = parseInt(el.dataset.iconIndex, 10);
    FACTORIES[slug](el, opts);
  });
}
function mountAll(animate) {
  document.querySelectorAll("section.slide").forEach((s) => mountIn(s, animate));
}

function boot() {
  const stage = document.querySelector("deck-stage");
  if (!stage) return;
  mountAll(false);
  stage.addEventListener("slidechange", (e) => {
    if (e.detail && e.detail.slide) mountIn(e.detail.slide, true);
  });
  requestAnimationFrame(() => {
    const active = stage.querySelector("section.slide:not([hidden])");
    if (active) mountIn(active, true);
  });
}
window.addEventListener("deck:accent-change", () => { mountAll(false); });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else { boot(); }
