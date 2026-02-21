import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class DAGTraversalService {
  private readonly logger = new Logger(DAGTraversalService.name);

  /**
   * Performs a topological sort on the workflow graph to determine execution order.
   * Note: This is simplified for workflows with a single trigger.
   */
  resolveExecutionOrder(nodes: any[], edges: any[]): any[] {
    const sorted: any[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (nodeId: string) => {
      if (visiting.has(nodeId)) {
        throw new Error(`Cycle detected at node ${nodeId}`);
      }
      if (!visited.has(nodeId)) {
        visiting.add(nodeId);
        const results = edges.filter((e) => e.source === nodeId);
        for (const edge of results) {
          visit(edge.target);
        }
        visiting.delete(nodeId);
        visited.add(nodeId);
        sorted.unshift(nodeId);
      }
    };

    // Find root nodes (nodes with no incoming edges)
    const targetIds = new Set(edges.map((e) => e.target));
    const rootNodes = nodes.filter((n) => !targetIds.has(n.id));

    for (const root of rootNodes) {
      visit(root.id);
    }

    return sorted.map((id) => nodes.find((n) => n.id === id));
  }

  /**
   * Returns nodes that can be executed based on satisfied dependencies
   */
  getReadyNodes(
    nodes: any[],
    edges: any[],
    executedNodeIds: Set<string>,
  ): any[] {
    return nodes.filter((node) => {
      if (executedNodeIds.has(node.id)) return false;

      const incomingEdges = edges.filter((e) => e.target === node.id);
      if (incomingEdges.length === 0) return true; // It's a root

      // Check if all sources of incoming edges have been executed
      return incomingEdges.every((e) => executedNodeIds.has(e.source));
    });
  }

  /**
   * Simple cycle detection
   */
  hasCycle(nodes: any[], edges: any[]): boolean {
    try {
      this.resolveExecutionOrder(nodes, edges);
      return false;
    } catch (e) {
      return true;
    }
  }
}
