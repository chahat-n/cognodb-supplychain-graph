import { getSession, closeDriver } from '../config/database';

async function seedGraphDatabase() {
  console.log('🌱 Starting CognoDB Supply Chain Database Seed...');
  const session = getSession();

  try {
    // 1. Clean existing database
    console.log('🧹 Clearing existing graph data...');
    await session.run('MATCH (n) DETACH DELETE n');

    // 2. Create nodes (Suppliers, Components, Products, Facilities, Customers)
    console.log('📦 Creating graph nodes...');

    // Suppliers
    await session.run(`
      UNWIND $suppliers AS s
      CREATE (n:Supplier {
        id: s.id,
        name: s.name,
        country: s.country,
        tier: s.tier,
        reliabilityScore: s.reliabilityScore
      })
    `, {
      suppliers: [
        { id: 'SUP-01', name: 'TSMC Semiconductor', country: 'Taiwan', tier: 'Tier 1', reliabilityScore: 0.95 },
        { id: 'SUP-02', name: 'ASML Lithography Systems', country: 'Netherlands', tier: 'Tier 1', reliabilityScore: 0.98 },
        { id: 'SUP-03', name: 'Foxconn Precision Mfg', country: 'Taiwan', tier: 'Tier 1', reliabilityScore: 0.88 },
        { id: 'SUP-04', name: 'Shin-Etsu Silicon', country: 'Japan', tier: 'Tier 2', reliabilityScore: 0.92 },
        { id: 'SUP-05', name: 'LG Energy Solution', country: 'South Korea', tier: 'Tier 1', reliabilityScore: 0.90 },
        { id: 'SUP-06', name: 'Murata Electronics', country: 'Japan', tier: 'Tier 2', reliabilityScore: 0.85 },
      ]
    });

    // Components
    await session.run(`
      UNWIND $components AS c
      CREATE (n:Component {
        id: c.id,
        name: c.name,
        category: c.category,
        stockLevel: c.stockLevel,
        criticality: c.criticality
      })
    `, {
      components: [
        { id: 'CMP-01', name: '3nm Wafer Die', category: 'Semiconductors', stockLevel: 4500, criticality: 'High' },
        { id: 'CMP-02', name: 'EV Battery Module 100kWh', category: 'Power Systems', stockLevel: 1200, criticality: 'High' },
        { id: 'CMP-03', name: 'Ultra-Pure Silicon Ingot', category: 'Raw Materials', stockLevel: 8000, criticality: 'High' },
        { id: 'CMP-04', name: 'MLCC Capacitor Array', category: 'Electronics', stockLevel: 15000, criticality: 'Medium' },
        { id: 'CMP-05', name: 'OLED Display Panel 4K', category: 'Displays', stockLevel: 3200, criticality: 'High' },
        { id: 'CMP-06', name: 'AI Neural Accelerator Chip', category: 'Semiconductors', stockLevel: 950, criticality: 'Critical' },
        { id: 'CMP-07', name: 'Titanium Enclosure Frame', category: 'Structures', stockLevel: 2100, criticality: 'Medium' },
      ]
    });

    // Products
    await session.run(`
      UNWIND $products AS p
      CREATE (n:Product {
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        margin: p.margin
      })
    `, {
      products: [
        { id: 'PRD-01', name: 'Apex Pro AI Server Node', sku: 'APX-AI-900', price: 15000, margin: 0.42 },
        { id: 'PRD-02', name: 'Vanguard EV Commercial Truck', sku: 'VNG-EV-2026', price: 65000, margin: 0.28 },
        { id: 'PRD-03', name: 'AeroBook Ultra Laptop', sku: 'AERO-15-X', price: 2200, margin: 0.35 },
        { id: 'PRD-04', name: 'Quantum Enterprise Gateway', sku: 'QNT-GW-5G', price: 8500, margin: 0.50 },
      ]
    });

    // Facilities
    await session.run(`
      UNWIND $facilities AS f
      CREATE (n:Facility {
        id: f.id,
        name: f.name,
        location: f.location,
        capacity: f.capacity
      })
    `, {
      facilities: [
        { id: 'FAC-01', name: 'Austin GigaFactory Hub', location: 'USA - Texas', capacity: 50000 },
        { id: 'FAC-02', name: 'Rotterdam Euro Logistics Hub', location: 'Netherlands', capacity: 35000 },
        { id: 'FAC-03', name: 'Singapore APAC DC', location: 'Singapore', capacity: 40000 },
      ]
    });

    // Customers
    await session.run(`
      UNWIND $customers AS cust
      CREATE (n:Customer {
        id: cust.id,
        name: cust.name,
        tier: cust.tier,
        region: cust.region
      })
    `, {
      customers: [
        { id: 'CUST-01', name: 'Meta Infrastructure Corp', tier: 'Enterprise', region: 'North America' },
        { id: 'CUST-02', name: 'AWS Cloud Fleet', tier: 'Enterprise', region: 'Global' },
        { id: 'CUST-03', name: 'European High-Speed Rail Authority', tier: 'Government', region: 'Europe' },
        { id: 'CUST-04', name: 'Tokyo Data Systems', tier: 'Commercial', region: 'Asia-Pacific' },
      ]
    });

    // 3. Create Typed Relationships
    console.log('🔗 Creating graph relationships...');

    // (Supplier)-[:SUPPLIES]->(Component)
    await session.run(`
      UNWIND $relSupplies AS item
      MATCH (s:Supplier {id: item.supplierId}), (c:Component {id: item.componentId})
      CREATE (s)-[:SUPPLIES {leadTimeDays: item.leadTimeDays, unitCost: item.unitCost}]->(c)
    `, {
      relSupplies: [
        { supplierId: 'SUP-04', componentId: 'CMP-03', leadTimeDays: 14, unitCost: 120 },
        { supplierId: 'SUP-01', componentId: 'CMP-01', leadTimeDays: 21, unitCost: 450 },
        { supplierId: 'SUP-01', componentId: 'CMP-06', leadTimeDays: 30, unitCost: 1200 },
        { supplierId: 'SUP-02', componentId: 'CMP-01', leadTimeDays: 45, unitCost: 890 },
        { supplierId: 'SUP-05', componentId: 'CMP-02', leadTimeDays: 25, unitCost: 3200 },
        { supplierId: 'SUP-06', componentId: 'CMP-04', leadTimeDays: 10, unitCost: 5 },
        { supplierId: 'SUP-03', componentId: 'CMP-05', leadTimeDays: 18, unitCost: 180 },
        { supplierId: 'SUP-03', componentId: 'CMP-07', leadTimeDays: 12, unitCost: 95 }
      ]
    });

    // (Component)-[:SUB_ASSEMBLY_OF]->(Component)
    await session.run(`
      UNWIND $relAssemblies AS item
      MATCH (c1:Component {id: item.subId}), (c2:Component {id: item.parentId})
      CREATE (c1)-[:SUB_ASSEMBLY_OF {quantityRequired: item.quantityRequired}]->(c2)
    `, {
      relAssemblies: [
        { subId: 'CMP-03', parentId: 'CMP-01', quantityRequired: 1 },
        { subId: 'CMP-01', parentId: 'CMP-06', quantityRequired: 2 },
        { subId: 'CMP-04', parentId: 'CMP-06', quantityRequired: 12 }
      ]
    });

    // (Component)-[:USED_IN]->(Product)
    await session.run(`
      UNWIND $relUsedIn AS item
      MATCH (c:Component {id: item.componentId}), (p:Product {id: item.productId})
      CREATE (c)-[:USED_IN {quantityRequired: item.quantityRequired}]->(p)
    `, {
      relUsedIn: [
        { componentId: 'CMP-06', productId: 'PRD-01', quantityRequired: 4 },
        { componentId: 'CMP-06', productId: 'PRD-04', quantityRequired: 2 },
        { componentId: 'CMP-02', productId: 'PRD-02', quantityRequired: 1 },
        { componentId: 'CMP-05', productId: 'PRD-03', quantityRequired: 1 },
        { componentId: 'CMP-07', productId: 'PRD-01', quantityRequired: 1 },
        { componentId: 'CMP-07', productId: 'PRD-03', quantityRequired: 1 }
      ]
    });

    // (Product)-[:STORED_AT]->(Facility)
    await session.run(`
      UNWIND $relStoredAt AS item
      MATCH (p:Product {id: item.productId}), (f:Facility {id: item.facilityId})
      CREATE (p)-[:STORED_AT {inventoryCount: item.inventoryCount}]->(f)
    `, {
      relStoredAt: [
        { productId: 'PRD-01', facilityId: 'FAC-01', inventoryCount: 450 },
        { productId: 'PRD-01', facilityId: 'FAC-03', inventoryCount: 300 },
        { productId: 'PRD-02', facilityId: 'FAC-01', inventoryCount: 85 },
        { productId: 'PRD-03', facilityId: 'FAC-02', inventoryCount: 1200 },
        { productId: 'PRD-04', facilityId: 'FAC-02', inventoryCount: 600 }
      ]
    });

    // (Product)-[:DELIVERED_TO]->(Customer)
    await session.run(`
      UNWIND $relDelivered AS item
      MATCH (p:Product {id: item.productId}), (c:Customer {id: item.customerId})
      CREATE (p)-[:DELIVERED_TO {orderId: item.orderId, status: item.status}]->(c)
    `, {
      relDelivered: [
        { productId: 'PRD-01', customerId: 'CUST-01', orderId: 'ORD-901', status: 'Active' },
        { productId: 'PRD-01', customerId: 'CUST-02', orderId: 'ORD-902', status: 'Active' },
        { productId: 'PRD-02', customerId: 'CUST-03', orderId: 'ORD-704', status: 'Active' },
        { productId: 'PRD-04', customerId: 'CUST-04', orderId: 'ORD-550', status: 'Pending' }
      ]
    });

    console.log('✅ Seed completed successfully! CognoDB contains Suppliers, Components, Products, Facilities & Customers.');
  } catch (error) {
    console.error('❌ Error seeding CognoDB database:', error);
    process.exit(1);
  } finally {
    await session.close();
    await closeDriver();
  }
}

// Run if executed directly
if (require.main === module) {
  seedGraphDatabase();
}

export { seedGraphDatabase };
