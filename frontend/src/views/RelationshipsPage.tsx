import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network, FolderKanban, Users, Building2, Car, Smartphone,
  MapPin, Archive, FileText, ZoomIn, ZoomOut, RotateCcw,
  ExternalLink, Info, Filter, Sparkles
} from 'lucide-react';
import { ApiService } from '../services/api';
import { Case, RelationshipGraphResponse, GraphNode, GraphEdge } from '../types';

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

  // Node category styling colors
  const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    case: { bg: '#1E3A8A', border: '#3B82F6', text: '#93C5FD' },
    officer: { bg: '#1E293B', border: '#60A5FA', text: '#BFDBFE' },
    person: { bg: '#312E81', border: '#6366F1', text: '#C7D2FE' },
    organization: { bg: '#164E63', border: '#06B6D4', text: '#A5F3FC' },
    vehicle: { bg: '#0C4A6E', border: '#0284C7', text: '#BAE6FD' },
    device: { bg: '#4C1D95', border: '#8B5CF6', text: '#DDD6FE' },
    location: { bg: '#78350F', border: '#F59E0B', text: '#FDE68A' },
    evidence: { bg: '#064E3B', border: '#10B981', text: '#A7F3D0' },
    document: { bg: '#022C22', border: '#059669', text: '#6EE7B7' },
  };

  // Calculate layout coordinates for nodes in radial / clustered hierarchy
  const computeNodePositions = (nodes: GraphNode[]) => {
    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const positions: Record<string, { x: number; y: number }> = {};
    if (nodes.length === 0) return positions;

    // Center root node
    positions[nodes[0].id] = { x: centerX, y: centerY };

    // Group other nodes by entity type
    const otherNodes = nodes.slice(1);
    const radius = 220;
    const angleStep = (2 * Math.PI) / Math.max(otherNodes.length, 1);

    otherNodes.forEach((node, idx) => {
      // Add slight jitter/stagger to avoid overlapping
      const r = radius + (idx % 2 === 0 ? -30 : 35);
      const angle = idx * angleStep;
      positions[node.id] = {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle)
      };
    });

    return positions;
  };

  const positions = graphData ? computeNodePositions(graphData.nodes) : {};

  // Pan handlers
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight m-0">Relationship Explorer</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
              Interactive Graph Network
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizes real relationships between Cases, People, Organizations, Vehicles, Devices, Evidence, and MongoDB Documents.
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Focus Root Case:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 font-mono"
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id}: {c.title.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#070B14] border border-slate-800 rounded-xl overflow-hidden relative h-[620px] select-none flex flex-col justify-between">
          {/* Controls Bar */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#0F172A]/90 backdrop-blur border border-slate-800 rounded-lg p-1.5 shadow-md">
            <button
              onClick={() => setZoom(z => Math.min(z + 0.15, 2.2))}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1.5 border-l border-slate-800">
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
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                Resolving graph nodes & edges from junction tables...
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
                          stroke="#334155"
                          strokeWidth="1.5"
                          strokeDasharray={edge.relationship_type === 'has_document' ? '4,4' : undefined}
                        />
                        <text
                          x={midX}
                          y={midY - 4}
                          fill="#94A3B8"
                          fontSize="9"
                          textAnchor="middle"
                          className="font-sans pointer-events-none"
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
                    const colors = NODE_COLORS[node.entity_type] || { bg: '#1E293B', border: '#475569', text: '#F1F5F9' };
                    const isSelected = selectedNode?.id === node.id;
                    const isRoot = node.id === graphData.root_entity.id;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={(e) => handleNodeClick(node, e)}
                        className="cursor-pointer group"
                      >
                        {/* Glow on select or root */}
                        {(isSelected || isRoot) && (
                          <circle
                            r={isRoot ? 34 : 26}
                            fill="none"
                            stroke={isRoot ? '#3B82F6' : '#A855F7'}
                            strokeWidth="3"
                            strokeOpacity="0.4"
                            className="animate-pulse"
                          />
                        )}

                        {/* Node Shape */}
                        <circle
                          r={isRoot ? 28 : 20}
                          fill={colors.bg}
                          stroke={isSelected ? '#FFFFFF' : colors.border}
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                          className="transition-all group-hover:stroke-white"
                        />

                        {/* Node Label */}
                        <text
                          textAnchor="middle"
                          dy={isRoot ? 4 : 3}
                          fill={colors.text}
                          fontSize={isRoot ? '10' : '8'}
                          fontWeight="bold"
                          className="pointer-events-none uppercase font-mono tracking-wider"
                        >
                          {node.entity_type.substring(0, 3)}
                        </text>

                        {/* Title text below */}
                        <text
                          textAnchor="middle"
                          dy={isRoot ? 42 : 32}
                          fill="#F1F5F9"
                          fontSize="10"
                          fontWeight="500"
                          className="pointer-events-none drop-shadow"
                        >
                          {node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          {/* Bottom Legend */}
          <div className="p-3 bg-[#0B1120]/90 border-t border-slate-800 text-[10px] flex items-center justify-between flex-wrap gap-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Entity Legend:</span>
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(NODE_COLORS).map(([type, c]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: c.bg, borderColor: c.border }}></span>
                  <span className="capitalize text-slate-300">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Inspector Sidebar */}
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0">
                Node Inspector
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                    {selectedNode.entity_type}
                  </span>
                  <h4 className="text-sm font-bold text-white m-0 mt-1">{selectedNode.label}</h4>
                  {selectedNode.sublabel && (
                    <div className="text-[11px] text-slate-400">{selectedNode.sublabel}</div>
                  )}
                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    ID: {selectedNode.id}
                  </div>
                </div>

                {selectedNode.details && Object.keys(selectedNode.details).length > 0 && (
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1 text-[11px]">Entity Attributes:</span>
                    <pre className="p-2.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 border border-slate-800 overflow-x-auto m-0">
                      {JSON.stringify(selectedNode.details, null, 2)}
                    </pre>
                  </div>
                )}

                <button
                  onClick={() => navigateToEntity(selectedNode)}
                  className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition"
                >
                  <span>Open Full Record Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Network className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>Click any node in the graph network to inspect connected relational attributes.</p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 mt-4">
            <span className="font-semibold text-slate-300 block mb-0.5">Academic Note:</span>
            Graph nodes are generated dynamically by traversing SQL junction tables (case_people, case_vehicles, etc.) and joining matching MongoDB documents by case_id.
          </div>
        </div>
      </div>
    </div>
  );
};
