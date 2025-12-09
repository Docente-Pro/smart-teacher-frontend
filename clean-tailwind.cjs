const fs = require('fs');

const filePath = './src/pages/DocTest.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remover clases de Tailwind comunes
const replacements = [
  [/className="text-gray-800"/g, ''],
  [/className="text-gray-700"/g, ''],
  [/className="text-cyan-600 mr-2"/g, 'style={{color: "#0891b2", marginRight: "0.5rem"}}'],
  [/className="flex items-start"/g, ''],
  [/className="flex"/g, ''],
  [/className="bg-white p-4 rounded-lg shadow-sm"/g, 'className="step-box"'],
  [/className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-cyan-600"/g, 'style={{background: "white", padding: "1.25rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderLeft: "4px solid #0891b2"}}'],
  [/className="font-bold text-blue-900 mb-2"/g, 'style={{fontWeight: "700"}}'],
  [/className="font-bold text-cyan-900 mb-3"/g, 'style={{fontWeight: "700"}}'],
  [/className="text-xl font-bold flex items-center gap-2"/g, 'style={{fontSize: "1.25rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem"}}'],
  [/className="space-y-1 ml-6"/g, ''],
  [/className="space-y-2 ml-6"/g, ''],
  [/className="space-y-3"/g, 'className="space-y-4"'],
  [/className="space-y-5"/g, 'className="space-y-4"'],
  [/className="space-y-1"/g, ''],
  [/className="mb-2"/g, ''],
  [/className="mb-3"/g, ''],
  [/className="mb-4"/g, ''],
  [/className="mb-6"/g, 'className="subsection"'],
  [/className="mb-8"/g, 'style={{marginBottom: "2rem"}}'],
  [/className="mt-3"/g, ''],
  [/className="mt-6"/g, ''],
  [/className="bg-cyan-50 p-6 rounded-b-lg border border-cyan-200 space-y-5"/g, 'className="phase-body space-y-4"'],
  [/className="bg-blue-50 p-6 rounded-b-lg border border-blue-200 space-y-4"/g, 'className="phase-body space-y-4"'],
  [/className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-t-lg"/g, 'className="phase-header"'],
  [/className="bg-white text-cyan-600 rounded-full w-8 h-8 flex items-center justify-center text-sm"/g, 'className="phase-number"'],
  [/className="bg-cyan-100 p-4 rounded-lg border-l-4 border-cyan-600"/g, 'className="highlight-box"'],
  [/className="text-gray-800 italic"/g, 'style={{fontStyle: "italic"}}'],
  [/className="text-gray-800 mb-2"/g, ''],
  [/className="italic"/g, 'style={{fontStyle: "italic"}}'],
  [/className="font-semibold text-blue-900"/g, 'style={{fontWeight: "600"}}'],
  [/className="border border-blue-200 p-3"/g, 'style={{border: "1px solid #dbeafe", padding: "0.75rem"}}'],
  [/className="border border-blue-200 p-3 font-semibold text-blue-900"/g, 'style={{border: "1px solid #dbeafe", padding: "0.75rem", fontWeight: "600"}}'],
  [/className="border border-blue-200 p-3 text-gray-800"/g, 'style={{border: "1px solid #dbeafe", padding: "0.75rem"}}'],
  [/className="border border-blue-700 p-3 text-left"/g, 'style={{border: "1px solid #1e40af", padding: "0.75rem", textAlign: "left"}}'],
  [/className="bg-blue-600 text-white"/g, ''],
  [/className="w-full border-collapse"/g, 'style={{width: "100%", borderCollapse: "collapse"}}'],
  [/className="overflow-x-auto"/g, ''],
  [/className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"/g, 'style={{fontSize: "1.875rem", fontWeight: "700", background: "linear-gradient(to right, #2563eb, #0891b2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}'],
  [/className="flex justify-between items-center mb-6"/g, 'style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"}}'],
  [/className="flex gap-3"/g, 'style={{display: "flex", gap: "0.75rem"}}'],
  [/className="gap-2"/g, 'style={{gap: "0.5rem"}}'],
  [/className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600"/g, 'style={{gap: "0.5rem"}} className="bg-gradient-to-r from-blue-600 to-cyan-600"'],
];

replacements.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// Limpiar atributos className vacíos
content = content.replace(/className=""\s*/g, '');
content = content.replace(/className=""\n/g, '');
content = content.replace(/<([a-z]+)\s+>/g, '<$1>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Clases de Tailwind limpiadas exitosamente');
