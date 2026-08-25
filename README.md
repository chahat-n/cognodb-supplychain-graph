# CognoDB — Supply Chain Risk & Downstream Blast Radius Navigator

> Built for the **Wexa AI Software Engineer (Full-Stack / Web)** Take-Home Assessment.  
> **Live Demo**: [https://cognodb-supplychain-graph.vercel.app](https://cognodb-supplychain-graph.vercel.app)  
> Powered by **CognoDB Cloud** (openCypher graph database over Neo4j Bolt 5.4 protocol) with a **React + TypeScript + Vite + Tailwind CSS** frontend and **Node.js + Express + TypeScript** backend.

---

## 1. Why a Graph Database?

In global supply chain management, entities are deeply interconnected through multi-tier relationships:
```
(Supplier) ➔ (Component) ➔ (Sub-Assembly) ➔ (Finished Product) ➔ (Warehouse Facility) ➔ (Customer)
```

### Relational Database Limitations (SQL)
- **Complex & Slow Multi-Hop Joins**: Answering a business-critical question like *"If Supplier TSMC experiences a 30-day factory delay, which downstream assemblies, finished SKUs, regional warehouses, and enterprise customer orders are impacted?"* requires join-heavy, recursive SQL Common Table Expressions (CTEs).
- **Fixed Schema Rigidity**: Adding new relationship types (e.g. `ALTERNATIVE_FOR` or `QUALITY_AUDITED_BY`) requires costly schema migrations and altering foreign key constraints across multiple tables.

### Graph Database Advantages (CognoDB & openCypher)
1. **Natural Relationship Traversal**: Relationships are first-class citizens stored directly alongside nodes. Traversing 5 hops downstream is a 1-line query in Cypher:
   ```cypher
   MATCH (s:Supplier {id: $supplierId})
   MATCH path = (s)-[:SUPPLIES|SUB_ASSEMBLY_OF|USED_IN|STORED_AT|DELIVERED_TO*1..6]->(impacted)
   RETURN path;
   ```
2. **Single Point of Failure (SPOF) Detection**: Detecting components that have zero redundant suppliers and threaten high-revenue products is fast and intuitive.
3. **Sub-millisecond Performance**: Path finding and transitive closures execute in milliseconds regardless of overall database size.

---

## 2. Graph Data Model

### Node Labels
- **`Supplier`**: `id`, `name`, `country`, `tier`, `reliabilityScore`
- **`Component`**: `id`, `name`, `category`, `stockLevel`, `criticality`
- **`Product`**: `id`, `name`, `sku`, `price`, `margin`
- **`Facility`**: `id`, `name`, `location`, `capacity`
- **`Customer`**: `id`, `name`, `tier`, `region`

### Relationship Types
```
(Supplier)-[:SUPPLIES {leadTimeDays, unitCost}]->(Component)
(Component)-[:SUB_ASSEMBLY_OF {quantityRequired}]->(Component)
(Component)-[:USED_IN {quantityRequired}]->(Product)
(Product)-[:STORED_AT {inventoryCount}]->(Facility)
(Product)-[:DELIVERED_TO {orderId, status}]->(Customer)
```

### ASCII Data Model Diagram
```
┌──────────────┐          SUPPLIES          ┌───────────────┐
│   Supplier   ├───────────────────────────►│   Component   │
└──────────────┘                            └───────┬───────┘
                                                    │ SUB_ASSEMBLY_OF
                                                    ▼
┌──────────────┐          STORED_AT         ┌───────────────┐
│   Facility   │◄───────────────────────────┤    Product    │
└──────────────┘                            └───────▲───────┘
                                                    │ USED_IN
┌──────────────┐        DELIVERED_TO        ┌───────┴───────┐
│   Customer   │◄───────────────────────────┤   Component   │
└──────────────┘                            └───────────────┘
```

---

## 3. Technology Stack

- **Database**: **CognoDB Cloud** (openCypher graph database engine over Bolt 5.4 protocol)
- **Database Driver**: Official `neo4j-driver` (Node.js)
- **Backend API**: Node.js, Express, TypeScript, `dotenv`, `cors`
- **Frontend UI**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Graph Visualization**: `vis-network` (Interactive HTML5 canvas for nodes/edges)

---

## 4. Key Cypher Queries Explained

### 1. Multi-Hop Blast Radius Traversal
Traverses up to 6 hops downstream from a disrupted entity to discover all affected components, assemblies, products, facilities, and end customers.
```cypher
MATCH (start {id: $entityId})
MATCH path = (start)-[:SUPPLIES|SUB_ASSEMBLY_OF|USED_IN|STORED_AT|DELIVERED_TO*1..6]->(impacted)
WITH start, path, impacted, length(path) AS hops,
     [node IN nodes(path) | coalesce(node.name, node.id)] AS pathNames
RETURN 
  impacted.id AS id,
  coalesce(impacted.name, impacted.id) AS name,
  labels(impacted)[0] AS type,
  hops,
  pathNames
ORDER BY hops ASC;
```

### 2. Single Point of Failure (SPOF) Detection (Relational-Awkward Query)
Identifies components that rely on a single vendor and calculates total product value at risk.
```cypher
MATCH (c:Component)<-[r:SUPPLIES]-(s:Supplier)
WITH c, count(s) AS supplierCount, collect(s) AS suppliers
WHERE supplierCount = 1
MATCH (c)-[:USED_IN|SUB_ASSEMBLY_OF*1..3]->(p:Product)
RETURN 
  c.id AS componentId,
  c.name AS componentName,
  c.criticality AS criticality,
  suppliers[0].name AS supplierName,
  suppliers[0].reliabilityScore AS supplierReliability,
  collect(DISTINCT p.name) AS impactedProducts,
  sum(p.price) AS totalValueAtRisk
ORDER BY totalValueAtRisk DESC;
```

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js (v18+)
- A free **CognoDB Cloud** instance (Create at [console.cognodb.com](https://console.cognodb.com))

### 1. Database Credentials Configuration
Copy `.env.example` to `.env` in the root directory and enter your CognoDB credentials:
```env
COGNO_DB_URI=bolt+s://<your-instance-id>.databases.cognodb.cloud
COGNO_DB_USER=cognodb
COGNO_DB_PASSWORD=<your-generated-password>
PORT=5000
```

### 2. Install & Seed Database
```bash
# Install backend dependencies
cd backend
npm install

# Seed CognoDB database with supply chain nodes & relationships
npm run seed
```

### 3. Start Backend API Server
```bash
# Run Express API server in development mode
npm run dev
# Server starts at http://localhost:5000
```

### 4. Install & Start Frontend Web UI
Open a second terminal window:
```bash
# Install frontend dependencies
cd frontend
npm install

# Launch React Vite dev server
npm run dev
# Open browser at http://localhost:5173
```

---

## 6. Engineering & Security Best Practices

- **Environment Variable Isolation**: Connection URIs and database credentials are read exclusively from `.env` and strictly excluded from Git tracking via `.gitignore`.
- **Parameterized Cypher Execution**: All openCypher queries utilize `$param` substitution via the official `neo4j-driver` to guarantee query sanitization and prevent injection.
- **Resilient Error Handling**: The application tests database connectivity on startup and provides graceful offline fallback UI banners when CognoDB Cloud is unreachable.
