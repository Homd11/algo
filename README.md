# 🚦 Cairo Transportation Optimizer

> **CSE112 — Design & Analysis of Algorithms**
> Alamein International University, Faculty of Computer Science & Engineering

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-black?style=for-the-badge)](https://algo-homd11.vercel.app)
[![Docker](https://img.shields.io/badge/🐳_Docker-Ready-2496ED?style=for-the-badge)](https://hub.docker.com)
[![TensorFlow.js](https://img.shields.io/badge/🤖_TensorFlow.js-ML_Prediction-FF6F00?style=for-the-badge)](https://www.tensorflow.org/js)

An interactive web-based visualization of shortest-path algorithms on Cairo's real transportation network, featuring **ML-powered traffic congestion prediction**, **side-by-side algorithm race animation**, and a comprehensive theoretical analysis.

---

## 🌐 Live Demo

👉 **[algo-homd11.vercel.app](https://algo-gules.vercel.app/)**

The entire app runs client-side in your browser — no backend needed.

---

## ✨ Features

### 🏁 Algorithm Race Visualizer
Side-by-side animated comparison of **Dijkstra's Algorithm** vs **A* Search** on the Cairo network. Watch in real-time as both algorithms explore the graph — A* typically settles **77% fewer nodes** thanks to its haversine heuristic.

### 🤖 ML Traffic Prediction
A **TensorFlow.js neural network** (3-layer dense model) trained in-browser on temporal traffic data from 28 roads × 4 time periods (112 samples). Select any road and time of day to predict congestion levels.

### 📡 Interactive Network Graph
Canvas-rendered visualization of Cairo's 25-node transportation network with real geographic coordinates, color-coded by district type (Residential, Business, Mixed, Industrial, Facility).

### 📊 Benchmark Dashboard
Empirical performance comparison of all 5 implemented algorithms with complexity analysis and bar charts.

---

## 🗂️ Repository Layout

```
algo/
├── webapp/                          — Interactive web frontend (static site)
│   ├── index.html                   — Single-page app
│   ├── style.css                    — Dark-mode glassmorphism design
│   ├── data.js                      — Cairo network data from CSVs
│   ├── algorithms.js                — Dijkstra & A* (step-by-step)
│   └── app.js                       — UI, canvas, race animation, ML model
├── Dockerfile                       — Multi-stage Docker build (Maven + nginx)
├── docker-compose.yml               — One-command container startup
├── vercel.json                      — Vercel deployment config
├── .github/workflows/deploy.yml     — GitHub Pages CI/CD
├── README.md                        — This file
├── THEORETICAL_ANALYSIS.md          — Full theoretical analysis document
├── pom.xml                          — Maven build configuration
├── build.sh                         — Plain javac build (no internet needed)
├── data/                            — Cairo dataset (CSV files)
│   ├── neighborhoods.csv
│   ├── facilities.csv
│   ├── existing_roads.csv
│   ├── potential_roads.csv
│   ├── traffic_flow.csv
│   ├── metro_lines.csv
│   ├── bus_routes.csv
│   └── public_transport_demand.csv
├── src/main/java/com/aiu/cse112/
│   ├── Main.java                    — CLI demo
│   ├── CorrectnessRunner.java       — Cross-algorithm tests
│   ├── algorithms/
│   │   ├── DijkstraArray.java       — O(V²) classical
│   │   ├── DijkstraHeap.java        — O((V+E) log V) binary-heap
│   │   ├── DijkstraTransport.java   — Transport-modified variant
│   │   ├── AStar.java               — A* with haversine heuristic
│   │   ├── BellmanFord.java         — Comparison baseline
│   │   └── FloydWarshall.java       — All-pairs comparison
│   ├── graph/
│   │   ├── Node.java, Edge.java, Graph.java
│   ├── io/
│   │   └── DataLoader.java
│   └── benchmark/
│       └── PerformanceBenchmark.java
└── results/
    └── benchmark_results.md
```

---

## 🚀 Quick Start

### Option 1: Live Demo (zero setup)
Visit **[algo-homd11.vercel.app](https://algo-homd11.vercel.app)**

### Option 2: Run Locally
```bash
# Just open the webapp in your browser
open webapp/index.html
# Or use any static server:
npx serve webapp
```

### Option 3: Docker 🐳
```bash
docker-compose up --build
# App available at http://localhost:8080
```

### Option 4: Java CLI
```bash
# Maven
mvn package
java -jar target/algo-1.0.0.jar

# Or plain javac (no internet)
chmod +x build.sh && ./build.sh
java -cp out com.aiu.cse112.Main
```

---

## 🤖 ML Model Details

| Property | Value |
|---|---|
| Framework | TensorFlow.js (runs in browser) |
| Training Data | `traffic_flow.csv` — 28 roads × 4 time periods = 112 samples |
| Architecture | Dense(32, ReLU) → Dense(16, ReLU) → Dense(1, sigmoid) |
| Input Features | One-hot road encoding + normalized time period |
| Training | 100 epochs, Adam optimizer, MSE loss |
| Training Time | ~2 seconds in-browser |

---

## 🐳 Docker

The project is fully containerized:

```bash
# Build and run
docker build -t cairo-transport .
docker run -p 8080:80 cairo-transport

# Or with docker-compose
docker-compose up --build
```

The Dockerfile uses a multi-stage build:
1. **Stage 1**: Maven builds the Java project
2. **Stage 2**: nginx:alpine serves the static web app

---

## 📈 Empirical Highlights

| Scenario | Best Algorithm | Why |
|---|---|---|
| SSSP on Cairo network | Dijkstra (binary heap) | O((V+E) log V) beats array and Bellman-Ford |
| Point-to-point query | A* (haversine) | 6× fewer pops than full SSSP |
| All-pairs (V = 25) | Floyd-Warshall | Constant factor wins at small V |
| All-pairs (V ≫ 100) | V × Dijkstra | Asymptotic advantage kicks in |

---

## 🛠️ Tech Stack

- **Backend**: Java 17 (Maven)
- **Frontend**: Vanilla HTML/CSS/JS + Canvas API
- **ML**: TensorFlow.js
- **Containerization**: Docker + nginx
- **Deployment**: Vercel (static site)
- **CI/CD**: GitHub Actions

---

## 👨‍💻 Authors

CSE112 Design & Analysis of Algorithms — Alamein International University

Source code provided for academic/educational use as part of CSE112 coursework.
