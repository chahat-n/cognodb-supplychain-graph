import { Router, Request, Response } from 'express';
import { getSession, testConnection } from '../config/database';
import { 
  FETCH_FULL_GRAPH_QUERY, 
  BLAST_RADIUS_QUERY, 
  SPOF_DETECTION_QUERY, 
  FIND_ALTERNATIVE_SUPPLIERS_QUERY,
  GRAPH_STATS_QUERY 
} from '../queries/cypherQueries';
import { seedGraphDatabase } from '../seed/seedData';

const router = Router();

// Health Check & Database Connection Test
router.get('/health', async (req: Request, res: Response) => {
  const status = await testConnection();
  res.status(status.connected ? 200 : 503).json(status);
});

// Fetch full graph for visualizer canvas
router.get('/graph', async (req: Request, res: Response) => {
  const session = getSession();
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const result = await session.run(FETCH_FULL_GRAPH_QUERY, { limit });

    const nodesMap = new Map();
    const edges: any[] = [];

    result.records.forEach(record => {
      const sourceNode = record.get('n');
      const rel = record.get('r');
      const targetNode = record.get('m');

      if (sourceNode) {
        const id = sourceNode.properties.id || sourceNode.identity.toString();
        const label = sourceNode.labels[0] || 'Unknown';
        nodesMap.set(id, {
          id,
          label: sourceNode.properties.name || id,
          type: label,
          properties: sourceNode.properties
        });
      }

      if (targetNode) {
        const id = targetNode.properties.id || targetNode.identity.toString();
        const label = targetNode.labels[0] || 'Unknown';
        nodesMap.set(id, {
          id,
          label: targetNode.properties.name || id,
          type: label,
          properties: targetNode.properties
        });
      }

      if (rel && sourceNode && targetNode) {
        edges.push({
          id: rel.identity.toString(),
          from: sourceNode.properties.id || sourceNode.identity.toString(),
          to: targetNode.properties.id || targetNode.identity.toString(),
          label: rel.type,
          properties: rel.properties
        });
      }
    });

    res.json({
      nodes: Array.from(nodesMap.values()),
      edges
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch graph topology', details: error.message });
  } finally {
    await session.close();
  }
});

// Multi-hop Blast Radius Traversal
router.get('/blast-radius/:id', async (req: Request, res: Response) => {
  const session = getSession();
  try {
    const entityId = req.params.id;
    const result = await session.run(BLAST_RADIUS_QUERY, { entityId });

    const impactedNodes = result.records.map(record => ({
      id: record.get('id'),
      name: record.get('name'),
      type: record.get('type'),
      hops: record.get('hops')?.toNumber() || record.get('hops'),
      pathNames: record.get('pathNames'),
      pathLabels: record.get('pathLabels')
    }));

    res.json({
      entityId,
      totalImpacted: impactedNodes.length,
      impactedNodes,
      cypherQueryUsed: BLAST_RADIUS_QUERY.trim()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to compute blast radius', details: error.message });
  } finally {
    await session.close();
  }
});

// Single Point of Failure (SPOF) Analysis
router.get('/spof', async (req: Request, res: Response) => {
  const session = getSession();
  try {
    const result = await session.run(SPOF_DETECTION_QUERY);
    const spofs = result.records.map(record => ({
      componentId: record.get('componentId'),
      componentName: record.get('componentName'),
      criticality: record.get('criticality'),
      supplierId: record.get('supplierId'),
      supplierName: record.get('supplierName'),
      supplierReliability: record.get('supplierReliability'),
      impactedProducts: record.get('impactedProducts'),
      totalValueAtRisk: record.get('totalValueAtRisk')
    }));

    res.json({
      spofCount: spofs.length,
      bottlenecks: spofs,
      cypherQueryUsed: SPOF_DETECTION_QUERY.trim()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to detect Single Points of Failure', details: error.message });
  } finally {
    await session.close();
  }
});

// Alternative Supplier Finder
router.get('/alternatives/:componentId', async (req: Request, res: Response) => {
  const session = getSession();
  try {
    const componentId = req.params.componentId;
    const result = await session.run(FIND_ALTERNATIVE_SUPPLIERS_QUERY, { componentId });
    const alternatives = result.records.map(record => ({
      supplierId: record.get('supplierId'),
      supplierName: record.get('supplierName'),
      country: record.get('country'),
      reliabilityScore: record.get('reliabilityScore'),
      altComponentId: record.get('altComponentId'),
      altComponentName: record.get('altComponentName')
    }));

    res.json({
      componentId,
      alternativeCount: alternatives.length,
      alternatives,
      cypherQueryUsed: FIND_ALTERNATIVE_SUPPLIERS_QUERY.trim()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to find alternative suppliers', details: error.message });
  } finally {
    await session.close();
  }
});

// Summary Stats
router.get('/stats', async (req: Request, res: Response) => {
  const session = getSession();
  try {
    const result = await session.run(GRAPH_STATS_QUERY);
    if (result.records.length > 0) {
      const record = result.records[0];
      res.json({
        nodes: record.get('nodeStats'),
        relationships: record.get('relStats')
      });
    } else {
      res.json({ nodes: [], relationships: [] });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch graph statistics', details: error.message });
  } finally {
    await session.close();
  }
});

// Re-seed Database On Demand
router.post('/seed', async (req: Request, res: Response) => {
  try {
    await seedGraphDatabase();
    res.json({ message: 'CognoDB graph database re-seeded successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to re-seed database', details: error.message });
  }
});

export default router;
