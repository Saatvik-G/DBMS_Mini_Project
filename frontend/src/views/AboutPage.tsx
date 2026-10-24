import React from 'react';
import {
  ShieldAlert, UserCheck, Database, Layers, Server, Code,
  ExternalLink, CheckCircle2, GitBranch, Terminal
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title & Attribution Header */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-blue-900/80 text-blue-300 border border-blue-700 font-semibold uppercase">
            DBMS Mini Project
          </span>
          <span className="text-xs text-slate-400">Department of Computer Science & Engineering</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight m-0">
          Intelligence Fusion Platform
        </h2>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
          A centralized investigation information management platform that combines structured relational records from PostgreSQL with flexible unstructured field documents from MongoDB to provide a single operational command picture.
        </p>
      </div>

      {/* Team Members Section */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0">
            Project Team Members
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-base flex-shrink-0">
              SG
            </div>
            <div>
              <h4 className="text-sm font-bold text-white m-0">Saatvik Gupta</h4>
              <div className="text-xs font-mono text-blue-400 font-semibold mt-0.5">
                SRN: PES1UG24CS395
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Backend Architecture, Relational Schema Normalization, MongoDB Indexing & Cross-Database Search Engine.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-base flex-shrink-0">
              SG
            </div>
            <div>
              <h4 className="text-sm font-bold text-white m-0">Satyam Goyal</h4>
              <div className="text-xs font-mono text-purple-400 font-semibold mt-0.5">
                SRN: PES1UG24CS424
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Frontend Architecture, Relationship Explorer Graph Visualization, Chronological Timelines & Analytics Dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0">
            System Architecture & Dual-Database Integration
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="font-semibold text-blue-400 flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              1. PostgreSQL Relational Layer (Primary System of Record)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed m-0">
              Stores structured entities requiring strict referential integrity, foreign key cascades, and ACID transactions:
            </p>
            <ul className="space-y-1 pl-4 text-slate-300 list-disc text-[11px]">
              <li><strong>Cases, Officers, People, Organizations</strong></li>
              <li><strong>Vehicles, Devices, Locations, Evidence</strong></li>
              <li><strong>11 Junction Bridge Tables</strong> for Many-to-Many associations</li>
              <li><strong>Audit Tables</strong>: evidence_custody & case_activity</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Server className="w-4 h-4" />
              2. MongoDB Document Store (Polymorphic Intelligence Store)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed m-0">
              Stores unstructured investigation documents with dynamic, schemaless fields:
            </p>
            <ul className="space-y-1 pl-4 text-slate-300 list-disc text-[11px]">
              <li><strong>9 Document Modalities</strong>: Witness statements, chat exports, CCTV metadata, etc.</li>
              <li><strong>Arbitrary Nested JSON</strong>: Camera telemetry, sensor logs, blockchain hashes</li>
              <li><strong>Compound Text Index</strong> across title, content, summary, and tags</li>
              <li><strong>Foreign Key References</strong> resolving back to SQL Case IDs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Implemented Technology Stack
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono">BACKEND API</span>
            <span className="font-semibold text-white mt-0.5 block">FastAPI (Python 3.13)</span>
            <span className="text-[11px] text-slate-400">Pydantic v2 & Uvicorn</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono">ORM & RELATIONAL DB</span>
            <span className="font-semibold text-white mt-0.5 block">SQLAlchemy 2.1</span>
            <span className="text-[11px] text-slate-400">PostgreSQL (psycopg3)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono">NOSQL DOCUMENT DB</span>
            <span className="font-semibold text-white mt-0.5 block">MongoDB 8.2</span>
            <span className="text-[11px] text-slate-400">PyMongo & Motor Drivers</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono">FRONTEND CLIENT</span>
            <span className="font-semibold text-white mt-0.5 block">Next.js 15 + TypeScript</span>
            <span className="text-[11px] text-slate-400">Tailwind CSS & Recharts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
