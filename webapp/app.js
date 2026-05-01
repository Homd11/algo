// ══════════════════════════════════════════════════════
//  APP.JS — Algorithm Race Visualizer
// ══════════════════════════════════════════════════════

// ── Canvas helpers ──────────────────────────────────────
function setupCanvas(id, h) {
  const c = document.getElementById(id)
  if (!c) return null
  const r = window.devicePixelRatio || 1
  const w = c.parentElement.clientWidth
  c.width = w * r
  c.height = h * r
  c.style.width = w + 'px'
  c.style.height = h + 'px'
  const ctx = c.getContext('2d')
  ctx.scale(r, r)
  return { c, ctx, w, h }
}

let COMPUTED_LAYOUT = null

function computeNodeLayout() {
  if (COMPUTED_LAYOUT) return COMPUTED_LAYOUT

  const xs = NODES.map(n => n.x)
  const ys = NODES.map(n => n.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const scale = Math.max(maxX - minX, maxY - minY) || 1

  const nodes = NODES.map(n => ({
    id: n.id,
    x: (n.x - minX) / scale + (scale - (maxX - minX)) / scale * 0.5,
    y: (n.y - minY) / scale + (scale - (maxY - minY)) / scale * 0.5,
    ox: (n.x - minX) / scale + (scale - (maxX - minX)) / scale * 0.5,
    oy: (n.y - minY) / scale + (scale - (maxY - minY)) / scale * 0.5,
  }))

  for (let iter = 0; iter < 180; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[i].x - nodes[j].x
        let dy = nodes[i].y - nodes[j].y
        let dist = Math.sqrt(dx * dx + dy * dy)
        if (dist === 0) {
          const angle = ((i * 31 + j * 17 + iter * 7) % 360) * (Math.PI / 180)
          dx = Math.cos(angle) * 0.002
          dy = Math.sin(angle) * 0.002
          dist = 0.002
        }
        const minDist = 0.22
        if (dist < minDist) {
          const force = (minDist - dist) / minDist * 0.18
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          nodes[i].x += fx
          nodes[i].y += fy
          nodes[j].x -= fx
          nodes[j].y -= fy
        }
      }
    }
    for (const n of nodes) {
      n.x += (n.ox - n.x) * 0.008
      n.y += (n.oy - n.y) * 0.008
    }
    let cx = 0, cy = 0
    for (const n of nodes) { cx += n.x; cy += n.y }
    cx /= nodes.length; cy /= nodes.length
    const offX = 0.5 - cx
    const offY = 0.5 - cy
    for (const n of nodes) {
      n.x = Math.max(0.02, Math.min(0.98, n.x + offX))
      n.y = Math.max(0.02, Math.min(0.98, n.y + offY))
    }
  }

  COMPUTED_LAYOUT = {}
  nodes.forEach(n => { COMPUTED_LAYOUT[n.id] = { x: n.x, y: n.y } })
  return COMPUTED_LAYOUT
}

function project(node, w, h, pad) {
  const layout = computeNodeLayout()
  const pos = layout[node.id]
  const sx = pos.x * (w - pad * 2) + pad
  const sy = (1 - pos.y) * (h - pad * 2) + pad
  return { sx, sy }
}

function drawGraph(ctx, w, h, opts = {}) {
  const pad = Math.max(16, Math.min(50, Math.min(w, h) * 0.08))
  const scale = Math.max(0.5, Math.min(w, h) / 480)
  const {
    settled = {},
    relaxed = {},
    pathSet = new Set(),
    source = null,
    target = null,
    algoColor = null
  } = opts

  ctx.clearRect(0, 0, w, h)

  // Draw edges
  EDGES.forEach(e => {
    const a = project(NODE_MAP[e.from], w, h, pad)
    const b = project(NODE_MAP[e.to], w, h, pad)
    const inPath = pathSet.has(e.from + '\u2192' + e.to) || pathSet.has(e.to + '\u2192' + e.from)
    ctx.beginPath()
    ctx.moveTo(a.sx, a.sy)
    ctx.lineTo(b.sx, b.sy)
    if (inPath) {
      ctx.strokeStyle = algoColor || '#6366f1'
      ctx.lineWidth = 3 * scale
      ctx.shadowColor = algoColor || '#6366f1'
      ctx.shadowBlur = 8 * scale
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = Math.max(0.5, scale)
      ctx.shadowBlur = 0
    }
    ctx.stroke()
    ctx.shadowBlur = 0
  })

  // Draw nodes
  NODES.forEach(n => {
    const p = project(n, w, h, pad)
    const baseR = n.pop > 0 ? (n.pop > 300000 ? 10 : n.pop > 100000 ? 8 : 6) : 5
    const r = baseR * scale
    let col = NODE_COLORS[n.type] || '#888'
    let glow = 0

    if (n.id === source) {
      col = '#ffffff'
      glow = 15 * scale
    } else if (n.id === target) {
      col = '#ef4444'
      glow = 15 * scale
    } else if (settled[n.id]) {
      col = algoColor || '#6366f1'
      glow = 8 * scale
    } else if (relaxed[n.id]) {
      col = 'rgba(255,255,255,0.25)'
      glow = 3 * scale
    }

    ctx.beginPath()
    ctx.arc(p.sx, p.sy, Math.max(2, r), 0, Math.PI * 2)
    if (glow) {
      ctx.shadowColor = col
      ctx.shadowBlur = glow
    }
    ctx.fillStyle = col
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Label
    if (scale > 0.6 || n.id === source || n.id === target) {
      ctx.fillStyle = 'rgba(240,240,250,0.5)'
      ctx.font = `500 ${Math.max(7, Math.round(9 * scale))}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(n.name, p.sx, p.sy - r - 5)
    }
  })
}

// ── Network Graph ───────────────────────────────────────
function initNetworkGraph() {
  const canvas = setupCanvas('networkCanvas', 520)
  if (!canvas) return
  drawGraph(canvas.ctx, canvas.w, canvas.h)
}

// ── Populate dropdowns ──────────────────────────────────
function initDropdowns() {
  const srcSel = document.getElementById('raceSource')
  const tgtSel = document.getElementById('raceTarget')
  const mlRoad = document.getElementById('mlRoad')

  if (srcSel && tgtSel) {
    NODES.forEach(n => {
      srcSel.add(new Option(`${n.id} \u2014 ${n.name}`, n.id))
      tgtSel.add(new Option(`${n.id} \u2014 ${n.name}`, n.id))
    })
    srcSel.value = '3'
    tgtSel.value = '12'
  }

  if (mlRoad) {
    TRAFFIC_FLOW.forEach(t => {
      mlRoad.add(new Option(t.road, t.road))
    })
  }
}

// ── Algorithm Selection ─────────────────────────────────
function initAlgorithmSelection() {
  const container = document.getElementById('algoSelection')
  if (!container) return

  container.innerHTML = ''
  Object.entries(ALGORITHMS).forEach(([id, algo]) => {
    const label = document.createElement('label')
    label.className = 'algo-checkbox'
    label.innerHTML = `
      <input type="checkbox" value="${id}" checked>
      <span class="check-indicator" style="border-color:${algo.color}"></span>
      <span style="color:${algo.color}">${algo.name}</span>
    `
    container.appendChild(label)
  })
}

function getSelectedAlgorithms() {
  const container = document.getElementById('algoSelection')
  if (!container) return Object.keys(ALGORITHMS)

  const checked = container.querySelectorAll('input[type="checkbox"]:checked')
  return Array.from(checked).map(cb => cb.value)
}

// ── Race Controller ──────────────────────────────────────
let raceController = null

class RaceController {
  constructor(selectedAlgorithms) {
    this.algorithms = selectedAlgorithms.length > 0 ? selectedAlgorithms : Object.keys(ALGORITHMS)
    this.results = {}
    this.states = {}
    this.canvases = {}
    this.running = false
    this.tickInterval = null
  }

  init() {
    const grid = document.getElementById('raceGrid')
    if (!grid) return
    grid.innerHTML = ''

    this.results = {}
    this.states = {}
    this.canvases = {}

    // Compute responsive canvas height based on grid width and algorithm count
    const gridWidth = grid.clientWidth
    const minPanelWidth = 360
    const maxCols = Math.max(1, Math.floor(gridWidth / minPanelWidth))
    const cols = Math.min(maxCols, this.algorithms.length)
    const panelWidth = gridWidth / cols
    const canvasHeight = Math.max(220, Math.min(380, panelWidth * 0.65))

    this.algorithms.forEach(id => {
      const algo = ALGORITHMS[id]
      const panel = document.createElement('div')
      panel.className = 'race-panel'
      panel.id = `panel-${id}`
      panel.innerHTML = `
        <div class="race-panel-header" style="border-color:${algo.color}33">
          <h3 style="color:${algo.color}">${algo.name}</h3>
          <span class="algo-badge" style="background:${algo.color}15;color:${algo.color}">${algo.complexity}</span>
        </div>
        <canvas id="canvas-${id}"></canvas>
        <div class="race-panel-stats">
          <div class="race-stat">
            <span class="race-stat-label">Explored</span>
            <span class="race-stat-value" id="${id}-explored">0</span>
          </div>
          <div class="race-stat">
            <span class="race-stat-label">Ops</span>
            <span class="race-stat-value" id="${id}-ops">0</span>
          </div>
          <div class="race-stat">
            <span class="race-stat-label">Path</span>
            <span class="race-stat-value" id="${id}-dist">\u2014</span>
          </div>
          <div class="race-stat">
            <span class="race-stat-label">Status</span>
            <span class="race-stat-value" id="${id}-status">Ready</span>
          </div>
        </div>
      `
      grid.appendChild(panel)

      const canvas = setupCanvas(`canvas-${id}`, canvasHeight)
      if (canvas) {
        this.canvases[id] = canvas
        // Draw initial static graph
        drawGraph(canvas.ctx, canvas.w, canvas.h, {
          source: document.getElementById('raceSource')?.value,
          target: document.getElementById('raceTarget')?.value,
          algoColor: algo.color
        })
      }

      this.results[id] = null
      this.states[id] = { settled: {}, relaxed: {}, stepIndex: 0, showPath: false, done: false }
    })
  }

  async run(source, target, speed) {
    this.running = true
    const btn = document.getElementById('raceBtn')
    if (btn) btn.disabled = true
    const resultEl = document.getElementById('raceResult')
    if (resultEl) resultEl.classList.remove('show')

    // Reset states
    this.algorithms.forEach(id => {
      this.states[id] = { settled: {}, relaxed: {}, stepIndex: 0, showPath: false, done: false }
      const exploredEl = document.getElementById(`${id}-explored`)
      const opsEl = document.getElementById(`${id}-ops`)
      const distEl = document.getElementById(`${id}-dist`)
      const statusEl = document.getElementById(`${id}-status`)
      if (exploredEl) exploredEl.textContent = '0'
      if (opsEl) opsEl.textContent = '0'
      if (distEl) distEl.textContent = '\u2014'
      if (statusEl) statusEl.textContent = 'Running...'
    })

    // Run all algorithms
    this.algorithms.forEach(id => {
      try {
        const runFn = ALGO_RUNNERS[id]
        this.results[id] = runFn(source, target)

        const distEl = document.getElementById(`${id}-dist`)
        if (distEl) {
          const td = this.results[id].totalDist
          distEl.textContent = td === Infinity ? 'No path' : td === -Infinity ? 'Neg cycle' : td.toFixed(1) + ' km'
        }
      } catch (err) {
        console.error(`Algorithm ${id} failed:`, err)
        const statusEl = document.getElementById(`${id}-status`)
        if (statusEl) statusEl.textContent = 'Error'
      }
    })

    // Animate step by step
    const animate = () => {
      let progress = false

      this.algorithms.forEach(id => {
        const res = this.results[id]
        if (!res) return

        const state = this.states[id]
        const steps = res.steps || []

        if (state.stepIndex < steps.length) {
          progress = true
          const step = steps[state.stepIndex]
          if (step.type === 'settle') {
            state.settled[step.node] = true
          } else {
            state.relaxed[step.node] = true
          }
          const exploredEl = document.getElementById(`${id}-explored`)
          const opsEl = document.getElementById(`${id}-ops`)
          if (exploredEl) exploredEl.textContent = Object.keys(state.settled).length
          if (opsEl) opsEl.textContent = step.ops
          state.stepIndex++
        }

        if (state.stepIndex >= steps.length && !state.done) {
          state.done = true
          const statusEl = document.getElementById(`${id}-status`)
          if (statusEl && statusEl.textContent === 'Running...') {
            statusEl.textContent = 'Done'
          }
        }

        if (state.done) {
          state.showPath = true
        }

        // Draw graph
        const pathSet = new Set()
        if (state.showPath && res.path && res.path.length > 0) {
          for (let j = 0; j < res.path.length - 1; j++) {
            pathSet.add(res.path[j] + '\u2192' + res.path[j + 1])
          }
        }

        const canvas = this.canvases[id]
        if (canvas) {
          drawGraph(canvas.ctx, canvas.w, canvas.h, {
            settled: state.settled,
            relaxed: state.relaxed,
            pathSet,
            source,
            target,
            algoColor: ALGORITHMS[id].color
          })
        }
      })

      if (progress && this.running) {
        this.tickInterval = setTimeout(animate, speed)
      } else {
        this.finish()
      }
    }

    animate()
  }

  finish() {
    this.running = false
    const btn = document.getElementById('raceBtn')
    if (btn) btn.disabled = false

    const stats = this.algorithms.map(id => ({
      id,
      explored: Object.keys(this.states[id].settled).length,
      ops: this.results[id]?.ops || 0,
      dist: this.results[id]?.totalDist
    }))

    // Sort by explored (ascending - less is better)
    stats.sort((a, b) => a.explored - b.explored)
    const winner = stats[0]

    const el = document.getElementById('raceResult')
    if (el) el.classList.add('show')

    if (winner) {
      const winnerAlgo = ALGORITHMS[winner.id]
      const winnerEl = document.getElementById('raceWinner')
      if (winnerEl) {
        winnerEl.innerHTML = `<span style="color:${winnerAlgo.color}">${winnerAlgo.name}</span> wins`
      }

      const detailEl = document.getElementById('raceDetail')
      if (detailEl) {
        detailEl.innerHTML =
          `Explored ${winner.explored} nodes with ${winner.ops} operations. ` +
          `Optimal path: ${winner.dist === Infinity ? 'No path found' : winner.dist.toFixed(1) + ' km'}.<br><br>` +
          `<div style="font-size:12px;color:var(--text-muted);line-height:1.6">` +
          stats.map(s => {
            return `<span style="color:${ALGORITHMS[s.id].color}">${ALGORITHMS[s.id].name}</span>: ` +
              `${s.explored} nodes, ${s.ops} ops`
          }).join('<br>') +
          `</div>`
      }
    }
  }

  stop() {
    if (this.tickInterval) {
      clearTimeout(this.tickInterval)
    }
    this.running = false
  }
}

function startRace() {
  if (raceController && raceController.running) return

  const src = document.getElementById('raceSource')?.value
  const tgt = document.getElementById('raceTarget')?.value
  const speed = +(document.getElementById('raceSpeed')?.value || 80)

  if (src === tgt) {
    alert('Source and target must differ')
    return
  }

  const selected = getSelectedAlgorithms()
  if (selected.length === 0) {
    alert('Please select at least one algorithm')
    return
  }

  raceController = new RaceController(selected)
  raceController.init()
  raceController.run(src, tgt, speed)
}

// ── Benchmark Charts ────────────────────────────────────
function drawBenchCharts() {
  const c1 = setupCanvas('benchChart1', 200)
  if (c1) {
    const data1 = [
      { label: 'Dijkstra\n(Array)', val: 19, col: '#6366f1' },
      { label: 'Dijkstra\n(Heap)', val: 12, col: '#8b5cf6' },
      { label: 'A*', val: 3, col: '#10b981' },
      { label: 'Bellman\nFord', val: 25, col: '#f59e0b' }
    ]
    drawBarChart(c1.ctx, c1.w, c1.h, data1)
  }

  const c2 = setupCanvas('benchChart2', 200)
  if (c2) {
    const data2 = [
      { label: 'Dijkstra\n(Array)', val: 28, col: '#6366f1' },
      { label: 'Dijkstra\n(Heap)', val: 22, col: '#8b5cf6' },
      { label: 'A*', val: 10, col: '#10b981' },
      { label: 'Bellman\nFord', val: 56, col: '#f59e0b' }
    ]
    drawBarChart(c2.ctx, c2.w, c2.h, data2)
  }
}

function drawBarChart(ctx, w, h, data) {
  ctx.clearRect(0, 0, w, h)
  const maxV = Math.max(...data.map(d => d.val)) * 1.3
  const barW = w / (data.length * 2 + 1)

  data.forEach((d, i) => {
    const x = barW + i * barW * 2
    const barH = (d.val / maxV) * (h - 60)
    const y = h - 30 - barH

    ctx.fillStyle = d.col
    ctx.beginPath()
    ctx.roundRect(x, y, barW, barH, 4)
    ctx.fill()

    ctx.fillStyle = 'rgba(240,240,250,0.8)'
    ctx.font = 'bold 12px system-ui, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(d.val, x + barW / 2, y - 6)

    ctx.fillStyle = 'rgba(240,240,250,0.4)'
    ctx.font = '500 9px system-ui, sans-serif'
    const lines = d.label.split('\n')
    lines.forEach((line, li) => {
      ctx.fillText(line, x + barW / 2, h - 12 + li * 12)
    })
  })
}

// ── ML Traffic Prediction ───────────────────────────────
let mlModel = null
let mlMaxFlow = 1

async function trainModel() {
  const status = document.getElementById('mlStatus')
  if (!status) return

  status.textContent = 'Training neural network...'

  const roadIds = TRAFFIC_FLOW.map(t => t.road)
  const numRoads = roadIds.length
  const xs = []
  const ys = []
  const periods = ['morning', 'afternoon', 'evening', 'night']
  const allFlows = []
  TRAFFIC_FLOW.forEach(t => periods.forEach(p => allFlows.push(t[p])))
  mlMaxFlow = Math.max(...allFlows)

  TRAFFIC_FLOW.forEach((t, ri) => {
    periods.forEach((p, pi) => {
      const input = new Array(numRoads).fill(0)
      input[ri] = 1
      input.push(pi / 3)
      xs.push(input)
      ys.push(t[p] / mlMaxFlow)
    })
  })

  const xTensor = tf.tensor2d(xs)
  const yTensor = tf.tensor2d(ys.map(v => [v]))

  mlModel = tf.sequential()
  mlModel.add(tf.layers.dense({ inputShape: [numRoads + 1], units: 32, activation: 'relu' }))
  mlModel.add(tf.layers.dense({ units: 16, activation: 'relu' }))
  mlModel.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }))
  mlModel.compile({ optimizer: tf.train.adam(0.01), loss: 'meanSquaredError' })

  await mlModel.fit(xTensor, yTensor, { epochs: 100, verbose: 0 })
  xTensor.dispose()
  yTensor.dispose()

  status.textContent = 'Model trained \u2014 ready to predict'
  status.classList.add('ready')
  const predictBtn = document.getElementById('predictBtn')
  if (predictBtn) predictBtn.disabled = false
  drawMLChart()
}

function predict() {
  if (!mlModel) return
  const roadId = document.getElementById('mlRoad')?.value
  const timeIdx = +(document.getElementById('timeSlider')?.value || 0)
  const ri = TRAFFIC_FLOW.findIndex(t => t.road === roadId)
  if (ri === -1) return

  const input = new Array(TRAFFIC_FLOW.length).fill(0)
  input[ri] = 1
  input.push(timeIdx / 3)
  const pred = mlModel.predict(tf.tensor2d([input]))
  const val = Math.round(pred.dataSync()[0] * mlMaxFlow)
  pred.dispose()

  const predEl = document.getElementById('predictionValue')
  if (predEl) predEl.textContent = val.toLocaleString()

  const periods = ['morning', 'afternoon', 'evening', 'night']
  const actual = TRAFFIC_FLOW[ri][periods[timeIdx]]
  const actualEl = document.getElementById('actualValue')
  if (actualEl) actualEl.textContent = actual.toLocaleString()

  drawMLChart(ri, timeIdx, val)
}

function drawMLChart(selRoad, selTime, predVal) {
  const canvas = setupCanvas('mlChart', 320)
  if (!canvas) return
  const { ctx, w, h } = canvas

  const ri = selRoad != null ? selRoad : 0
  const t = TRAFFIC_FLOW[ri]
  const vals = [t.morning, t.afternoon, t.evening, t.night]
  const maxV = Math.max(...vals) * 1.2
  const barW = w / 6
  const gap = 20
  const startX = (w - barW * 4 - gap * 3) / 2
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b']

  ctx.clearRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(240,240,250,0.5)'
  ctx.font = '700 11px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('TRAFFIC FLOW \u2014 ' + t.road, w / 2, 25)

  vals.forEach((v, i) => {
    const x = startX + i * (barW + gap)
    const barH = (v / maxV) * (h - 90)
    const y = h - 50 - barH

    ctx.fillStyle = colors[i]
    ctx.beginPath()
    ctx.roundRect(x, y, barW, barH, 6)
    ctx.fill()

    if (selTime === i) {
      ctx.strokeStyle = colors[i]
      ctx.lineWidth = 2
      ctx.shadowColor = colors[i]
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.roundRect(x - 2, y - 2, barW + 4, barH + 4, 8)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    ctx.fillStyle = 'rgba(240,240,250,0.8)'
    ctx.font = '600 11px system-ui, monospace'
    ctx.textAlign = 'center'
    ctx.fillText(v.toLocaleString(), x + barW / 2, y - 8)

    ctx.fillStyle = 'rgba(240,240,250,0.35)'
    ctx.font = '500 9px system-ui, sans-serif'
    ctx.fillText(TIME_LABELS[i], x + barW / 2, h - 32)
  })

  if (predVal != null && selTime != null) {
    const x = startX + selTime * (barW + gap) + barW / 2
    const predH = (predVal / maxV) * (h - 90)
    const py = h - 50 - predH
    ctx.beginPath()
    ctx.arc(x, py, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#10b981'
    ctx.shadowColor = '#10b981'
    ctx.shadowBlur = 12
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#10b981'
    ctx.font = 'bold 10px system-ui, monospace'
    ctx.fillText('ML: ' + predVal.toLocaleString(), x, py - 12)
  }
}

// ── Event Listeners ─────────────────────────────────────
document.getElementById('timeSlider')?.addEventListener('input', e => {
  const label = document.getElementById('timeLabel')
  if (label) label.textContent = TIME_LABELS[+e.target.value]
})

document.getElementById('raceBtn')?.addEventListener('click', startRace)

// ── Scroll animations ──────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible')
  })
}, { threshold: 0.1 })

document.querySelectorAll('.animate-in').forEach(el => observer.observe(el))

// ── Resize handler ──────────────────────────────────────
let resizeTimer
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    COMPUTED_LAYOUT = null
    initNetworkGraph()
    drawBenchCharts()
    drawMLChart()
  }, 200)
})

// ── Init ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initDropdowns()
  initAlgorithmSelection()
  initNetworkGraph()
  drawBenchCharts()
  drawMLChart()
  trainModel()
})