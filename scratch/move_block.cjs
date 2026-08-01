const fs = require('fs');
const file = 'src/pages/Dashboard/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const startPattern = '        <div className="bg-white rounded-lg shadow overflow-hidden">\n          <div className="px-6 py-3 bg-[#00a884] border-b border-gray-200">';
const startIndex = content.indexOf(startPattern);

if (startIndex === -1) {
  console.error('Could not find start pattern');
  process.exit(1);
}

const endPattern = '    </div>\n    </div>\n  );\n};\n\nexport default Dashboard;';
const endIndex = content.indexOf(endPattern);

if (endIndex === -1) {
  console.error('Could not find end pattern');
  process.exit(1);
}

const blockToMove = content.substring(startIndex, endIndex);
content = content.substring(0, startIndex) + content.substring(endIndex);

const insertPattern = '      <div className="max-w-4xl mx-auto space-y-8">\n        \n';
const insertIndex = content.indexOf(insertPattern) + insertPattern.length;

if (insertIndex === -1) {
  console.error('Could not find insert pattern');
  process.exit(1);
}

content = content.substring(0, insertIndex) + blockToMove + '\n' + content.substring(insertIndex);

fs.writeFileSync(file, content);
console.log('Successfully moved the block!');
