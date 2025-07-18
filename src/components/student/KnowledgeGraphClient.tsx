// frontend/src/components/student/KnowledgeGraphClient.tsx
"use client";
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

// This component takes nodes and edges from the database and renders them
export const KnowledgeGraphClient = ({ nodes, edges }) => {
    const initialNodes = nodes.map((node, i) => ({
        id: node.id,
        data: { label: node.concept_name },
        position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 150 },
    }));
    
    const initialEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        label: edge.relationship_description,
        animated: true,
    }));

    return (
        <div style={{ height: '80vh' }}>
            <ReactFlow nodes={initialNodes} edges={initialEdges}>
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
};
