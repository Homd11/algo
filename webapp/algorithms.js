/**
 * Binary Min-Heap implementation for priority queue operations.
 */
class MinHeap {
  constructor(key = (x) => x.k) {
    this.heap = []
    this.key = key
  }

  push(item) {
    this.heap.push(item)
    this._bubbleUp(this.heap.length - 1)
  }

  pop() {
    if (this.heap.length === 0) return null
    const min = this.heap[0]
    const last = this.heap.pop()
    if (this.heap.length > 0) {
      this.heap[0] = last
      this._bubbleDown(0)
    }
    return min
  }

  get size() {
    return this.heap.length
  }

  _bubbleUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (this.key(this.heap[p]) <= this.key(this.heap[i])) break
      ;[this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]]
      i = p
    }
  }

  _bubbleDown(i) {
    const n = this.heap.length
    while (true) {
      let smallest = i
      const l = 2 * i + 1
      const r = 2 * i + 2
      if (l < n && this.key(this.heap[l]) < this.key(this.heap[smallest])) smallest = l
      if (r < n && this.key(this.heap[r]) < this.key(this.heap[smallest])) smallest = r
      if (smallest === i) break
      ;[this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]]
      i = smallest
    }
  }
}

/**
 * Algorithm Registry
 */
const ALGORITHMS = {
  dijkstraArray: {
    id: 'dijkstraArray',
    name: 'Dijkstra (Array)',
    complexity: 'O(V\u00B2)',
    description: 'Linear search priority queue',
    color: '#6366f1'
  },
  dijkstraHeap: {
    id: 'dijkstraHeap',
    name: 'Dijkstra (Heap)',
    complexity: 'O((V+E) log V)',
    description: 'Binary heap priority queue',
    color: '#8b5cf6'
  },
  astar: {
    id: 'astar',
    name: 'A* Search',
    complexity: 'O((V+E) log V)',
    description: 'Heuristic-guided search',
    color: '#10b981'
  },
  bellmanFord: {
    id: 'bellmanFord',
    name: 'Bellman-Ford',
    complexity: 'O(V\u00B7E)',
    description: 'Dynamic programming',
    color: '#f59e0b'
  },
  floydWarshall: {
    id: 'floydWarshall',
    name: 'Floyd-Warshall',
    complexity: 'O(V\u00B3)',
    description: 'All-pairs shortest paths',
    color: '#ef4444'
  }
}

/**
 * Reconstruct path from predecessor map
 */
function reconstructPath(prev, source, target) {
  const path = []
  let c = target
  while (c && prev[c] !== undefined) {
    path.unshift(c)
    c = prev[c]
  }
  if (c === source) {
    path.unshift(source)
  }
  return path
}

// ─────────────────────────────────────────────────────────────────────────────
// Dijkstra with Array (O(V\u00B2))
// ─────────────────────────────────────────────────────────────────────────────
function dijkstraArraySteps(source, target) {
  const dist = {}
  const prev = {}
  const settled = {}
  const steps = []
  let ops = 0

  NODES.forEach(n => {
    dist[n.id] = Infinity
    prev[n.id] = undefined
    settled[n.id] = false
  })
  dist[source] = 0

  for (let i = 0; i < NODES.length; i++) {
    let u = null
    let minDist = Infinity
    for (const n of NODES) {
      if (!settled[n.id] && dist[n.id] < minDist) {
        minDist = dist[n.id]
        u = n.id
      }
    }

    if (u === null) break

    settled[u] = true
    steps.push({ node: u, type: 'settle', dist: dist[u], ops: ++ops })

    if (u === target) break

    for (const e of ADJ[u]) {
      if (settled[e.to]) continue
      ops++
      const alt = dist[u] + e.w
      if (alt < dist[e.to]) {
        dist[e.to] = alt
        prev[e.to] = u
        steps.push({ node: e.to, type: 'relax', dist: alt, ops })
      }
    }
  }

  const path = reconstructPath(prev, source, target)
  return {
    dist,
    prev,
    steps,
    path,
    totalDist: dist[target],
    ops
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dijkstra with Binary Heap (O((V+E) log V))
// ─────────────────────────────────────────────────────────────────────────────
function dijkstraHeapSteps(source, target) {
  const dist = {}
  const prev = {}
  const settled = {}
  const steps = []
  let ops = 0

  NODES.forEach(n => {
    dist[n.id] = Infinity
    prev[n.id] = undefined
    settled[n.id] = false
  })
  dist[source] = 0

  const pq = new MinHeap()
  pq.push({ k: 0, v: source })

  while (pq.size > 0) {
    const { k, v: u } = pq.pop()

    if (settled[u]) continue
    if (k > dist[u]) continue

    settled[u] = true
    steps.push({ node: u, type: 'settle', dist: dist[u], ops: ++ops })

    if (u === target) break

    for (const e of ADJ[u]) {
      if (settled[e.to]) continue
      ops++
      const alt = dist[u] + e.w
      if (alt < dist[e.to]) {
        dist[e.to] = alt
        prev[e.to] = u
        pq.push({ k: alt, v: e.to })
        steps.push({ node: e.to, type: 'relax', dist: alt, ops })
      }
    }
  }

  const path = reconstructPath(prev, source, target)
  return {
    dist,
    prev,
    steps,
    path,
    totalDist: dist[target],
    ops
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// A* Search with Haversine Heuristic
// ─────────────────────────────────────────────────────────────────────────────
function haversineDistance(a, b) {
  const R = 6371
  const toRad = Math.PI / 180
  const dLat = (b.y - a.y) * toRad
  const dLon = (b.x - a.x) * toRad
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.y * toRad) * Math.cos(b.y * toRad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function astarSteps(source, target) {
  const gScore = {}
  const prev = {}
  const closed = {}
  const steps = []
  let ops = 0

  const targetNode = NODE_MAP[target]

  NODES.forEach(n => {
    gScore[n.id] = Infinity
    prev[n.id] = undefined
    closed[n.id] = false
  })
  gScore[source] = 0

  const pq = new MinHeap()
  pq.push({ k: haversineDistance(NODE_MAP[source], targetNode), v: source })

  while (pq.size > 0) {
    const { v: u } = pq.pop()

    if (closed[u]) continue
    closed[u] = true
    steps.push({ node: u, type: 'settle', dist: gScore[u], ops: ++ops })

    if (u === target) break

    for (const e of ADJ[u]) {
      if (closed[e.to]) continue
      ops++
      const tent = gScore[u] + e.w
      if (tent < gScore[e.to]) {
        gScore[e.to] = tent
        prev[e.to] = u
        pq.push({
          k: tent + haversineDistance(NODE_MAP[e.to], targetNode),
          v: e.to
        })
        steps.push({ node: e.to, type: 'relax', dist: tent, ops })
      }
    }
  }

  const path = reconstructPath(prev, source, target)
  return {
    dist: gScore,
    prev,
    steps,
    path,
    totalDist: gScore[target],
    ops
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bellman-Ford (O(V\u00B7E))
// ─────────────────────────────────────────────────────────────────────────────
function bellmanFordSteps(source, target) {
  const dist = {}
  const prev = {}
  const steps = []
  let ops = 0

  NODES.forEach(n => {
    dist[n.id] = Infinity
    prev[n.id] = undefined
  })
  dist[source] = 0

  for (let i = 0; i < NODES.length - 1; i++) {
    let updated = false
    for (const e of EDGES) {
      ops++
      if (dist[e.from] !== Infinity && dist[e.from] + e.dist < dist[e.to]) {
        dist[e.to] = dist[e.from] + e.dist
        prev[e.to] = e.from
        updated = true
        steps.push({
          node: e.to,
          type: 'relax',
          dist: dist[e.to],
          ops,
          edge: `${e.from}\u2192${e.to}`
        })
      }
      if (dist[e.to] !== Infinity && dist[e.to] + e.dist < dist[e.from]) {
        dist[e.from] = dist[e.to] + e.dist
        prev[e.from] = e.to
        updated = true
        steps.push({
          node: e.from,
          type: 'relax',
          dist: dist[e.from],
          ops,
          edge: `${e.to}\u2192${e.from}`
        })
      }
    }
    if (!updated) break
  }

  // Detect negative cycles
  let hasNegativeCycle = false
  for (const e of EDGES) {
    if (dist[e.from] !== Infinity && dist[e.from] + e.dist < dist[e.to]) {
      hasNegativeCycle = true
      break
    }
    if (dist[e.to] !== Infinity && dist[e.to] + e.dist < dist[e.from]) {
      hasNegativeCycle = true
      break
    }
  }

  for (const n of NODES) {
    if (dist[n.id] !== Infinity) {
      steps.push({ node: n.id, type: 'settle', dist: dist[n.id], ops })
    }
  }

  const path = hasNegativeCycle ? [] : reconstructPath(prev, source, target)
  return {
    dist,
    prev,
    steps,
    path,
    totalDist: hasNegativeCycle ? -Infinity : dist[target],
    hasNegativeCycle
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Floyd-Warshall (O(V\u00B3))
// ─────────────────────────────────────────────────────────────────────────────
function floydWarshallSteps(source, target) {
  const dist = {}
  const next = {}
  const steps = []
  let ops = 0

  // Initialize distance matrix with IDs as keys
  for (const n of NODES) {
    dist[n.id] = {}
    next[n.id] = {}
    for (const m of NODES) {
      dist[n.id][m.id] = n.id === m.id ? 0 : Infinity
      next[n.id][m.id] = undefined
    }
  }

  // Set direct edge distances (bidirectional)
  for (const e of EDGES) {
    dist[e.from][e.to] = e.dist
    dist[e.to][e.from] = e.dist
    next[e.from][e.to] = e.to
    next[e.to][e.from] = e.from
  }

  // Triple nested loops using node IDs
  for (const k of NODES) {
    const kid = k.id
    for (const i of NODES) {
      const iid = i.id
      for (const j of NODES) {
        const jid = j.id
        ops++
        if (dist[iid][kid] !== Infinity && dist[kid][jid] !== Infinity) {
          const viaK = dist[iid][kid] + dist[kid][jid]
          if (viaK < dist[iid][jid]) {
            dist[iid][jid] = viaK
            next[iid][jid] = next[iid][kid]
          }
        }
      }
    }
    steps.push({ node: k.id, type: 'settle', dist: 0, ops, label: `via ${k.name}` })
  }

  // Reconstruct path
  const path = []
  if (next[source][target] !== undefined) {
    let u = source
    while (u !== target) {
      path.push(u)
      u = next[u][target]
      if (!u) break
    }
    path.push(target)
  }

  return {
    dist: dist[source],
    prev: {},
    steps,
    path,
    totalDist: dist[source][target],
    ops
  }
}

// Algorithm run functions map
const ALGO_RUNNERS = {
  dijkstraArray: dijkstraArraySteps,
  dijkstraHeap: dijkstraHeapSteps,
  astar: astarSteps,
  bellmanFord: bellmanFordSteps,
  floydWarshall: floydWarshallSteps
}