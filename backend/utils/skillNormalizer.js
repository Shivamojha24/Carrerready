const aliases={js:'javascript',javascript:'javascript',ts:'typescript',typescript:'typescript',cpp:'c++','c++':'c++',node:'node.js','nodejs':'node.js','node.js':'node.js',mongo:'mongodb',mongodb:'mongodb',reactjs:'react',react:'react'};
exports.normalize=s=>aliases[String(s||'').trim().toLowerCase()]||String(s||'').trim().toLowerCase();
exports.unique=skills=>[...new Set((skills||[]).map(exports.normalize).filter(Boolean))];
