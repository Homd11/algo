// Cairo transportation network data from CSV files
const NODES=[
{id:"1",name:"Maadi",pop:250000,type:"Residential",x:31.25,y:29.96},
{id:"2",name:"Nasr City",pop:500000,type:"Mixed",x:31.34,y:30.06},
{id:"3",name:"Downtown Cairo",pop:100000,type:"Business",x:31.24,y:30.04},
{id:"4",name:"New Cairo",pop:300000,type:"Residential",x:31.47,y:30.03},
{id:"5",name:"Heliopolis",pop:200000,type:"Mixed",x:31.32,y:30.09},
{id:"6",name:"Zamalek",pop:50000,type:"Residential",x:31.22,y:30.06},
{id:"7",name:"6th October City",pop:400000,type:"Mixed",x:30.98,y:29.93},
{id:"8",name:"Giza",pop:550000,type:"Mixed",x:31.21,y:29.99},
{id:"9",name:"Mohandessin",pop:180000,type:"Business",x:31.20,y:30.05},
{id:"10",name:"Dokki",pop:220000,type:"Mixed",x:31.21,y:30.03},
{id:"11",name:"Shubra",pop:450000,type:"Residential",x:31.24,y:30.11},
{id:"12",name:"Helwan",pop:350000,type:"Industrial",x:31.33,y:29.85},
{id:"13",name:"New Admin Capital",pop:50000,type:"Government",x:31.80,y:30.02},
{id:"14",name:"Al Rehab",pop:120000,type:"Residential",x:31.49,y:30.06},
{id:"15",name:"Sheikh Zayed",pop:150000,type:"Residential",x:30.94,y:30.01},
{id:"F1",name:"Cairo Airport",pop:0,type:"Airport",x:31.41,y:30.11},
{id:"F2",name:"Ramses Station",pop:0,type:"Transit Hub",x:31.25,y:30.06},
{id:"F3",name:"Cairo University",pop:0,type:"Education",x:31.21,y:30.03},
{id:"F4",name:"Al-Azhar University",pop:0,type:"Education",x:31.26,y:30.05},
{id:"F5",name:"Egyptian Museum",pop:0,type:"Tourism",x:31.23,y:30.05},
{id:"F6",name:"Cairo Stadium",pop:0,type:"Sports",x:31.30,y:30.07},
{id:"F7",name:"Smart Village",pop:0,type:"Business",x:30.97,y:30.07},
{id:"F8",name:"Cairo Festival City",pop:0,type:"Commercial",x:31.40,y:30.03},
{id:"F9",name:"Qasr El Aini Hospital",pop:0,type:"Medical",x:31.23,y:30.03},
{id:"F10",name:"Maadi Military Hospital",pop:0,type:"Medical",x:31.25,y:29.95}
];

const EDGES=[
{from:"1",to:"3",dist:8.5,cap:3000,cond:7},
{from:"1",to:"8",dist:6.2,cap:2500,cond:6},
{from:"2",to:"3",dist:5.9,cap:2800,cond:8},
{from:"2",to:"5",dist:4.0,cap:3200,cond:9},
{from:"3",to:"5",dist:6.1,cap:3500,cond:7},
{from:"3",to:"6",dist:3.2,cap:2000,cond:8},
{from:"3",to:"9",dist:4.5,cap:2600,cond:6},
{from:"3",to:"10",dist:3.8,cap:2400,cond:7},
{from:"4",to:"2",dist:15.2,cap:3800,cond:9},
{from:"4",to:"14",dist:5.3,cap:3000,cond:10},
{from:"5",to:"11",dist:7.9,cap:3100,cond:7},
{from:"6",to:"9",dist:2.2,cap:1800,cond:8},
{from:"7",to:"8",dist:24.5,cap:3500,cond:8},
{from:"7",to:"15",dist:9.8,cap:3000,cond:9},
{from:"8",to:"10",dist:3.3,cap:2200,cond:7},
{from:"8",to:"12",dist:14.8,cap:2600,cond:5},
{from:"9",to:"10",dist:2.1,cap:1900,cond:7},
{from:"10",to:"11",dist:8.7,cap:2400,cond:6},
{from:"11",to:"F2",dist:3.6,cap:2200,cond:7},
{from:"12",to:"1",dist:12.7,cap:2800,cond:6},
{from:"13",to:"4",dist:45.0,cap:4000,cond:10},
{from:"14",to:"13",dist:35.5,cap:3800,cond:9},
{from:"15",to:"7",dist:9.8,cap:3000,cond:9},
{from:"F1",to:"5",dist:7.5,cap:3500,cond:9},
{from:"F1",to:"2",dist:9.2,cap:3200,cond:8},
{from:"F2",to:"3",dist:2.5,cap:2000,cond:7},
{from:"F7",to:"15",dist:8.3,cap:2800,cond:8},
{from:"F8",to:"4",dist:6.1,cap:3000,cond:9},
{from:"3",to:"F4",dist:2.5,cap:2000,cond:7},
{from:"3",to:"F5",dist:1.5,cap:1800,cond:9},
{from:"3",to:"F9",dist:1.5,cap:2000,cond:7},
{from:"5",to:"F6",dist:3.0,cap:2800,cond:8},
{from:"8",to:"F3",dist:4.0,cap:2500,cond:7},
{from:"10",to:"F3",dist:0.5,cap:1500,cond:8},
{from:"1",to:"F10",dist:1.0,cap:1800,cond:8}
];

const TRAFFIC_FLOW=[
{road:"1-3",morning:2800,afternoon:1500,evening:2600,night:800},
{road:"1-8",morning:2200,afternoon:1200,evening:2100,night:600},
{road:"2-3",morning:2700,afternoon:1400,evening:2500,night:700},
{road:"2-5",morning:3000,afternoon:1600,evening:2800,night:650},
{road:"3-5",morning:3200,afternoon:1700,evening:3100,night:800},
{road:"3-6",morning:1800,afternoon:1400,evening:1900,night:500},
{road:"3-9",morning:2400,afternoon:1300,evening:2200,night:550},
{road:"3-10",morning:2300,afternoon:1200,evening:2100,night:500},
{road:"4-2",morning:3600,afternoon:1800,evening:3300,night:750},
{road:"4-14",morning:2800,afternoon:1600,evening:2600,night:600},
{road:"5-11",morning:2900,afternoon:1500,evening:2700,night:650},
{road:"6-9",morning:1700,afternoon:1300,evening:1800,night:450},
{road:"7-8",morning:3200,afternoon:1700,evening:3000,night:700},
{road:"7-15",morning:2800,afternoon:1500,evening:2600,night:600},
{road:"8-10",morning:2000,afternoon:1100,evening:1900,night:450},
{road:"8-12",morning:2400,afternoon:1300,evening:2200,night:500},
{road:"9-10",morning:1800,afternoon:1200,evening:1700,night:400},
{road:"10-11",morning:2200,afternoon:1300,evening:2100,night:500},
{road:"11-F2",morning:2100,afternoon:1200,evening:2000,night:450},
{road:"12-1",morning:2600,afternoon:1400,evening:2400,night:550},
{road:"13-4",morning:3800,afternoon:2000,evening:3500,night:800},
{road:"14-13",morning:3600,afternoon:1900,evening:3300,night:750},
{road:"15-7",morning:2800,afternoon:1500,evening:2600,night:600},
{road:"F1-5",morning:3300,afternoon:2200,evening:3100,night:1200},
{road:"F1-2",morning:3000,afternoon:2000,evening:2800,night:1100},
{road:"F2-3",morning:1900,afternoon:1600,evening:1800,night:900},
{road:"F7-15",morning:2600,afternoon:1500,evening:2400,night:550},
{road:"F8-4",morning:2800,afternoon:1600,evening:2600,night:600},
{road:"3-F4",morning:2200,afternoon:1400,evening:2000,night:600},
{road:"3-F5",morning:2000,afternoon:1300,evening:1800,night:500},
{road:"3-F9",morning:2100,afternoon:1400,evening:1900,night:550},
{road:"5-F6",morning:2500,afternoon:1500,evening:2300,night:700},
{road:"8-F3",morning:1800,afternoon:1100,evening:1600,night:400},
{road:"10-F3",morning:1500,afternoon:1000,evening:1400,night:350},
{road:"1-F10",morning:1700,afternoon:1200,evening:1600,night:450}
];

const TIME_LABELS=["Morning Peak","Afternoon","Evening Peak","Night"];
const NODE_COLORS={Residential:"#6a5fc1",Mixed:"#8b8ba0",Business:"#fa7faa",Industrial:"#ffb287",Government:"#ffb287",Airport:"#c2ef4e","Transit Hub":"#c2ef4e",Education:"#c2ef4e",Tourism:"#c2ef4e",Sports:"#c2ef4e",Commercial:"#c2ef4e",Medical:"#c2ef4e"};

function buildAdj(){
  const adj={};
  NODES.forEach(n=>adj[n.id]=[]);
  EDGES.forEach(e=>{
    adj[e.from].push({to:e.to,w:e.dist,cap:e.cap,cond:e.cond});
    adj[e.to].push({to:e.from,w:e.dist,cap:e.cap,cond:e.cond});
  });
  return adj;
}

function haversine(a,b){
  const R=6371,toR=Math.PI/180;
  const dLat=(b.y-a.y)*toR,dLon=(b.x-a.x)*toR;
  const x=Math.sin(dLat/2)**2+Math.cos(a.y*toR)*Math.cos(b.y*toR)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}

const ADJ=buildAdj();
const NODE_MAP={};
NODES.forEach(n=>NODE_MAP[n.id]=n);
