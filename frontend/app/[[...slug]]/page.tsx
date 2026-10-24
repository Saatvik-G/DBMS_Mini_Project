import ClientApp from '../client-app';

export default function CatchAllPage() {
  return <ClientApp />;
}

export function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['cases'] },
    { slug: ['people'] },
    { slug: ['organizations'] },
    { slug: ['vehicles'] },
    { slug: ['devices'] },
    { slug: ['locations'] },
    { slug: ['evidence'] },
    { slug: ['documents'] },
    { slug: ['search'] },
    { slug: ['relationships'] },
    { slug: ['analytics'] },
    { slug: ['dbms-concepts'] },
    { slug: ['about'] },
    { slug: ['login'] },
  ];
}
