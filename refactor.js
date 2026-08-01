import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip config.ts and mockData.ts as they are already handled manually
  if (file.endsWith('config.ts') || file.endsWith('mockData.ts') || file.endsWith('simulationUtils.ts') || file.endsWith('App.tsx') || file.endsWith('Dashboard.tsx') || file.endsWith('PaymentModal.tsx') || file.endsWith('useSimulation.ts')) return;

  const configImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]*config\/config)['"];/g;
  
  let match;
  let changed = false;
  
  while ((match = configImportRegex.exec(content)) !== null) {
    const importedVarsStr = match[1]; 
    const importPath = match[2]; 
    
    // Only process if it's not already importing useConfig
    if (importedVarsStr.includes('useConfig')) continue;

    content = content.replace(match[0], `import { useConfig } from '${importPath}';`);
    
    const funcRegex = /(?:export\s+)?(?:(?:const|let)\s+\w+\s*:\s*React\.FC(?:<[^>]*>)?\s*=\s*\([^)]*\)\s*=>\s*\{|const\s+\w+\s*=\s*(?:<[^>]+>\s*)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{|function\s+\w+\s*\([^)]*\)\s*\{)/;
    const funcMatch = funcRegex.exec(content);
    
    if (funcMatch) {
      const insertPos = funcMatch.index + funcMatch[0].length;
      const hookCall = `\n  const { ${importedVarsStr.trim()} } = useConfig();`;
      content = content.slice(0, insertPos) + hookCall + content.slice(insertPos);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
