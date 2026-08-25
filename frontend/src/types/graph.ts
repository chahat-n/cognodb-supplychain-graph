export type NodeType = 'Supplier' | 'Component' | 'Product' | 'Facility' | 'Customer';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  properties: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ImpactedNode {
  id: string;
  name: string;
  type: NodeType;
  hops: number;
  pathNames: string[];
  pathLabels: string[];
}

export interface BlastRadiusResult {
  entityId: string;
  totalImpacted: number;
  impactedNodes: ImpactedNode[];
  cypherQueryUsed: string;
}

export interface SPOFBottleneck {
  componentId: string;
  componentName: string;
  criticality: string;
  supplierId: string;
  supplierName: string;
  supplierReliability: number;
  impactedProducts: string[];
  totalValueAtRisk: number;
}

export interface SPOFResult {
  spofCount: number;
  bottlenecks: SPOFBottleneck[];
  cypherQueryUsed: string;
}

export interface AlternativeSupplier {
  supplierId: string;
  supplierName: string;
  country: string;
  reliabilityScore: number;
  altComponentId: string;
  altComponentName: string;
}

export interface AlternativeResult {
  componentId: string;
  alternativeCount: number;
  alternatives: AlternativeSupplier[];
  cypherQueryUsed: string;
}

export interface DatabaseHealth {
  connected: boolean;
  message: string;
  details?: string;
}
