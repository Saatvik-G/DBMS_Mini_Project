import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';
import { ApiService } from '../services/api';
import { Case, RelationshipGraphResponse, GraphNode } from '../types';

export const RelationshipsPage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('CASE-2026-001');
  const [graphData, setGraphData] = useState<RelationshipGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadGraph('case', selectedCaseId);
    }
  }, [selectedCaseId]);

  const loadCases = async () => {
    try {
      const data = await ApiService.getCases();
      setCases(data);
      if (data.length > 0 && !selectedCaseId) {
        setSelectedCaseId(data[0].case_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadGraph = async (type: string, id: string) => {
    setLoading(true);
    setSelectedNode(null);
    try {
      const data = await ApiService.getRelationships(type, id);
      setGraphData(data);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const computeNodePositions = (nodes: GraphNode[]) => {
    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const positions: Record<string, { x: number; y: number }> = {};
    if (nodes.length === 0) return positions;

    // Center root node
    positions[nodes[0].id] = { x: centerX, y: centerY };

    // Group other nodes in a circle
    const otherNodes = nodes.slice(1);
    const radius = 210;
    const angleStep = (2 * Math.PI) / Math.max(otherNodes.length, 1);

    otherNodes.forEach((node, idx) => {
      const r = radius + (idx % 2 === 0 ? -25 : 25);
      const angle = idx * angleStep;
      positions[node.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      };
    });

    return positions;
  };

  const positions = graphData ? computeNodePositions(graphData.nodes) : {};

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNodeClick = (node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(node);
  };

  const navigateToEntity = (node: GraphNode) => {
    if (node.entity_type === 'case') navigate(`/cases/${node.id}`);
    else if (node.entity_type === 'person') navigate(`/people`);
    else if (node.entity_type === 'vehicle') navigate(`/vehicles`);
    else if (node.entity_type === 'device') navigate(`/devices`);
    else if (node.entity_type === 'location') navigate(`/locations`);
    else if (node.entity_type === 'evidence') navigate(`/evidence`);
    else if (node.entity_type === 'document') navigate(`/documents`);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Relationship Graph</h1>
          <p className="text-xs text-slate-400">
            Node-link visualization of associations across cases, people, vehicles, and evidence
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Focus Case:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-[#0E1420] border border-[#1E2638] text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id}: {c.title.substring(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-[#0B0F17] border border-[#1E2638] rounded overflow-hidden relative h-[580px] select-none flex flex-col justify-between">
          {/* Controls Bar */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-[#0E1420] border border-[#1E2638] rounded p-1">
            <button
              onClick={() => setZoom(z => Math.min(z + 0.15, 2.0))}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-[#141C2B] transition-colors duration-150"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-[#141C2B] transition-colors duration-150"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-[#141C2B] transition-colors duration-150"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1.5 border-l border-[#1E2638]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Interactive SVG Canvas */}
          <div
            className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                Resolving entity relations...
              </div>
            ) : !graphData || graphData.nodes.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                No relationships linked to this entity.
              </div>
            ) : (
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 800 550"
                className="w-full h-full"
              >
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Edges */}
                  {graphData.edges.map((edge) => {
                    const src = positions[edge.source];
                    const tgt = positions[edge.target];
                    if (!src || !tgt) return null;

                    const midX = (src.x + tgt.x) / 2;
                    const midY = (src.y + tgt.y) / 2;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke="#1E2638"
                          strokeWidth="1.5"
                          strokeDasharray={edge.relationship_type === 'has_document' ? '3,3' : undefined}
                        />
                        <text
                          x={midX}
                          y={midY - 4}
                          textAnchor="middle"
                          fill="#64748B"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {graphData.nodes.map((node) => {
                    const pos = positions[node.id];
                    if (!pos) return null;
                    const isSelected = selectedNode?.id === node.id;
                    const isRoot = node.id === selectedCaseId;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={(e) => handleNodeClick(node, e)}
                        className="cursor-pointer"
                      >
                        <circle
                          r={isRoot ? 26 : 20}
                          fill={isRoot ? '#1E3A8A' : '#0E1420'}
                          stroke={isSelected ? '#3B82F6' : '#1E2638'}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <text
                          y={-2}
                          textAnchor="middle"
                          fill={isRoot ? '#93C5FD' : '#E2E8F0'}
                          fontSize={isRoot ? '9' : '8'}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {node.id.length > 10 ? node.id.substring(0, 8) + '..' : node.id}
                        </text>
                        <text
                          y={9}
                          textAnchor="middle"
                          fill="#8B95A5"
                          fontSize="7"
                          fontFamily="sans-serif"
                        >
                          {node.label.length > 12 ? node.label.substring(0, 10) + '..' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>
        </div>

        {/* Selected Node Inspector Sidebar */}
        <div className="bg-[#0B0F17] border border-[#1E2638] rounded p-4 space-y-3">
          <div className="text-xs font-medium text-slate-200 pb-2 border-b border-[#1E2638]">
            Node Inspector
          </div>

          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Identifier:</span>
                <span className="font-mono text-blue-400 font-medium">{selectedNode.id}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Entity Type:</span>
                <span className="font-mono text-slate-200 capitalize">{selectedNode.entity_type}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Name / Label:</span>
                <span className="font-medium text-slate-200">{selectedNode.label}</span>
              </div>

              {selectedNode.details && Object.keys(selectedNode.details).length > 0 && (
                <div className="pt-2 border-t border-[#1E2638] space-y-1.5">
                  <span className="text-slate-500 text-[11px] block">Attributes:</span>
                  {Object.entries(selectedNode.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px] text-slate-400">
                      <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span>
                      <span className="font-mono text-slate-300 truncate max-w-[140px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigateToEntity(selectedNode)}
                className="w-full mt-2 py-1.5 px-3 bg-[#0E1420] hover:bg-[#141C2B] border border-[#1E2638] text-slate-200 rounded text-xs transition-colors duration-150 flex items-center justify-center gap-1.5"
              >
                <span>Open Entity Record</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-xs">
              Click any node in the graph to inspect its attributes and traverse relationships.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
