import numpy as np
import networkx as nx
from itertools import combinations
import logging
from datetime import datetime, timedelta

class CorrelationService:
    def __init__(self, similarity_threshold=0.9, min_cluster_size=5):
        self.similarity_threshold = similarity_threshold
        self.min_cluster_size = min_cluster_size
        self.logger = logging.getLogger(__name__)

    def find_clusters(self, anomaly_data):
        """
        anomaly_data: List of dicts: {'tenant_id': str, 'vector': [features]}
        Returns: List of clusters (lists of tenant IDs)
        """
        if len(anomaly_data) < self.min_cluster_size:
            return []

        # 1. Build Graph
        G = nx.Graph()
        for data in anomaly_data:
            G.add_node(data['tenant_id'], vector=np.array(data['vector']))

        # 2. Add Edges based on Behavioral Similarity
        nodes = list(G.nodes(data=True))
        for (u, u_data), (v, v_data) in combinations(nodes, 2):
            vec_u = u_data['vector']
            vec_v = v_data['vector']
            
            similarity = self.cosine_similarity(vec_u, vec_v)
            if similarity > self.similarity_threshold:
                G.add_edge(u, v, weight=similarity)

        # 3. Find Connected Components
        clusters = [list(c) for c in nx.connected_components(G) if len(c) >= self.min_cluster_size]
        
        if clusters:
            self.logger.info(f"🔮 CTAC Detected {len(clusters)} cross-tenant anomaly clusters!")
            
        return clusters

    @staticmethod
    def cosine_similarity(a, b):
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0
        return np.dot(a, b) / (norm_a * norm_b)
