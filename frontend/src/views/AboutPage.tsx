import React from 'react';
import { UserCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Title & Attribution Header */}
      <div className="p-4 rounded bg-[#0B0F17] border border-[#1E2638] space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0E1420] text-slate-400 border border-[#1E2638]">
            DBMS Mini Project • UE24CS395
          </span>
          <span className="text-xs text-slate-500">Department of CSE, PES University</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-100">
          Case Management Platform
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl m-0">
          A centralized digital investigation management system combining a 22-table normalized relational schema (PostgreSQL with SQLite fallback) and a polymorphic document store (MongoDB).
        </p>
      </div>

      {/* Team Members Section */}
      <div className="p-4 rounded bg-[#0B0F17] border border-[#1E2638] space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-semibold text-slate-200 m-0">
            Project Contributors
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded bg-[#0E1420] border border-[#1E2638] space-y-1">
            <h3 className="text-sm font-semibold text-slate-100 m-0">Saatvik Gupta</h3>
            <div className="text-xs font-mono text-blue-400">
              SRN: PES1UG24CS395
            </div>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Backend Architecture, Relational Schema Normalization (22 Tables, BCNF), Advanced SQL (Stored Procedures, Triggers, Recursive CTE), and Cross-Database Integration.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#0E1420] border border-[#1E2638] space-y-1">
            <h3 className="text-sm font-semibold text-slate-100 m-0">Satyam Goyal</h3>
            <div className="text-xs font-mono text-blue-400">
              SRN: PES1UG24CS424
            </div>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Frontend Client Engineering, Relationship Graph Visualization, MongoDB Schema & Indexing, and Role-Based Access Control.
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="p-4 rounded bg-[#0B0F17] border border-[#1E2638] space-y-3">
        <h2 className="text-xs font-semibold text-slate-200 m-0">
          Persistence Architecture & Database Partitioning
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3.5 rounded bg-[#0E1420] border border-[#1E2638] space-y-1.5">
            <div className="font-medium text-slate-200">
              1. Relational Engine (PostgreSQL / SQLite Fallback)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed m-0">
              Primary system of record enforcing referential integrity, foreign key cascades, check constraints, and ACID transactions:
            </p>
            <ul className="space-y-1 pl-4 text-slate-300 list-disc text-[11px] m-0">
              <li>10 primary entity and audit tables: cases, people, organizations, vehicles, devices, locations, evidence, evidence_custody, officers, case_activity</li>
              <li>12 associative junction tables enforcing BCNF many-to-many associations</li>
              <li>Stored procedures, triggers, views, and recursive graph traversal queries</li>
            </ul>
          </div>

          <div className="p-3.5 rounded bg-[#0E1420] border border-[#1E2638] space-y-1.5">
            <div className="font-medium text-slate-200">
              2. Document Store (MongoDB)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed m-0">
              Stores unstructured investigation telemetry with polymorphic schemas without requiring database migrations:
            </p>
            <ul className="space-y-1 pl-4 text-slate-300 list-disc text-[11px] m-0">
              <li>9 polymorphic document types (CCTV telemetry, phone extractions, audio logs)</li>
              <li>Weighted compound text indexing across title, content, summary, and tags</li>
              <li>Foreign entity references linking back to relational Case IDs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="p-4 rounded bg-[#0B0F17] border border-[#1E2638] space-y-2">
        <h2 className="text-xs font-semibold text-slate-200 m-0">
          Technology Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded bg-[#0E1420] border border-[#1E2638]">
            <span className="text-slate-500 block text-[10px] font-mono">BACKEND API</span>
            <span className="font-medium text-slate-200 block mt-0.5">FastAPI (Python 3.13)</span>
            <span className="text-[11px] text-slate-400">Pydantic v2 & Uvicorn</span>
          </div>
          <div className="p-2.5 rounded bg-[#0E1420] border border-[#1E2638]">
            <span className="text-slate-500 block text-[10px] font-mono">ORM & RELATIONAL DB</span>
            <span className="font-medium text-slate-200 block mt-0.5">SQLAlchemy 2.0</span>
            <span className="text-[11px] text-slate-400">PostgreSQL (psycopg3)</span>
          </div>
          <div className="p-2.5 rounded bg-[#0E1420] border border-[#1E2638]">
            <span className="text-slate-500 block text-[10px] font-mono">DOCUMENT DB</span>
            <span className="font-medium text-slate-200 block mt-0.5">MongoDB 7.0+</span>
            <span className="text-[11px] text-slate-400">PyMongo Driver</span>
          </div>
          <div className="p-2.5 rounded bg-[#0E1420] border border-[#1E2638]">
            <span className="text-slate-500 block text-[10px] font-mono">FRONTEND UI</span>
            <span className="font-medium text-slate-200 block mt-0.5">Next.js 15 + React</span>
            <span className="text-[11px] text-slate-400">Tailwind CSS & Recharts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
