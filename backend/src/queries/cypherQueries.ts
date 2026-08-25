/**
 * Parameterized Cypher Queries for CognoDB Graph Application
 * 
 * Strict requirement: All queries must use parameters ($param) 
 * to prevent injection and enable query plan caching.
 */

// 1. Fetch entire graph topology for visualization (Nodes + Relationships)
export const FETCH_FULL_GRAPH_QUERY = `
MATCH (n)
OPTIONAL MATCH (n)-[r]->(m)
RETURN n, r, m
LIMIT $limit;
`;

// 2. Multi-hop Blast Radius Traversal (1 to 6 hops downstream)
// Given a supplier or component ID, find all downstream impacted components, products, facilities, and customers
export const BLAST_RADIUS_QUERY = `
MATCH (start {id: $entityId})
MATCH path = (start)-[:SUPPLIES|SUB_ASSEMBLY_OF|USED_IN|STORED_AT|DELIVERED_TO*1..6]->(impacted)
WITH start, path, impacted, length(path) AS hops,
     [node IN nodes(path) | labels(node)[0]] AS pathLabels,
     [node IN nodes(path) | coalesce(node.name, node.id)] AS pathNames
RETURN 
  impacted.id AS id,
  coalesce(impacted.name, impacted.id) AS name,
  labels(impacted)[0] AS type,
  impacted AS properties,
  hops,
  pathNames,
  pathLabels
ORDER BY hops ASC;
`;

// 3. Relational-Awkward Query: Single Point of Failure (SPOF) Detection
// Finds components that have only 1 supplier and are used in products generating high value
export const SPOF_DETECTION_QUERY = `
MATCH (c:Component)<-[r:SUPPLIES]-(s:Supplier)
WITH c, count(s) AS supplierCount, collect(s) AS suppliers
WHERE supplierCount = 1
MATCH (c)-[:USED_IN|SUB_ASSEMBLY_OF*1..3]->(p:Product)
RETURN 
  c.id AS componentId,
  c.name AS componentName,
  c.criticality AS criticality,
  suppliers[0].id AS supplierId,
  suppliers[0].name AS supplierName,
  suppliers[0].reliabilityScore AS supplierReliability,
  collect(DISTINCT p.name) AS impactedProducts,
  sum(p.price) AS totalValueAtRisk
ORDER BY totalValueAtRisk DESC;
`;

// 4. Alternative Supplier Discovery (Path Finder)
// Given a failing component, find alternative suppliers who supply similar category components
export const FIND_ALTERNATIVE_SUPPLIERS_QUERY = `
MATCH (target:Component {id: $componentId})
MATCH (target)<-[:SUPPLIES]-(currentSupplier:Supplier)
MATCH (altSupplier:Supplier)-[:SUPPLIES]->(altComp:Component)
WHERE altComp.category = target.category AND altSupplier.id <> currentSupplier.id
RETURN 
  altSupplier.id AS supplierId,
  altSupplier.name AS supplierName,
  altSupplier.country AS country,
  altSupplier.reliabilityScore AS reliabilityScore,
  altComp.id AS altComponentId,
  altComp.name AS altComponentName
ORDER BY altSupplier.reliabilityScore DESC;
`;

// 5. Graph Overview & Statistics Summary
export const GRAPH_STATS_QUERY = `
MATCH (n)
WITH labels(n)[0] AS label, count(n) AS nodeCount
WITH collect({label: label, count: nodeCount}) AS nodeStats
MATCH ()-[r]->()
WITH nodeStats, type(r) AS relType, count(r) AS relCount
WITH nodeStats, collect({type: relType, count: relCount}) AS relStats
RETURN nodeStats, relStats;
`;
