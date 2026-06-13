const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let issues = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const dir = path.dirname(file);
      const resolved = path.resolve(dir, importPath);
      // We need to check if the resolved file exists with the exact casing.
      // On Mac, fs.existsSync returns true even if casing is wrong.
      // So we must read the directory and find the exact match.
      const targetDir = path.dirname(resolved);
      const targetBase = path.basename(resolved);
      
      try {
        const dirContents = fs.readdirSync(targetDir);
        // Sometimes imports omit the extension. Let's find matches.
        const matchingFiles = dirContents.filter(f => f.toLowerCase() === targetBase.toLowerCase() || f.toLowerCase().startsWith(targetBase.toLowerCase() + '.'));
        if (matchingFiles.length > 0) {
          const exactMatch = matchingFiles.find(f => f === targetBase || f.startsWith(targetBase + '.'));
          if (!exactMatch) {
            console.log(`Case mismatch in ${file}: imported '${importPath}', found '${matchingFiles[0]}'`);
            issues++;
          }
        }
      } catch (e) {
        // Directory might not exist or we are importing something else.
      }
    }
  }
});

if (issues === 0) {
  console.log("No case mismatches found.");
}
