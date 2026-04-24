const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\akchh\\OneDrive\\Documents\\MDB\\Megadiscountstore';
const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/Megadiscountstore/g, 'Megadiscountbazar')
    .replace(/megadiscountstore/g, 'megadiscountbazar')
    .replace(/Mega Discount Store/g, 'Mega Discount Bazar')
    .replace(/mega discount store/gi, 'mega discount bazar');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    if (excludeDirs.includes(file)) continue;
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (stat.isFile()) {
      // Only process text files (js, ts, tsx, jsx, html, json, md, css)
      const ext = path.extname(fullPath).toLowerCase();
      if (['.js', '.ts', '.tsx', '.jsx', '.html', '.json', '.md', '.css'].includes(ext) || file === '.env') {
        try {
          replaceInFile(fullPath);
        } catch (e) {
          // ignore binary read error
        }
      }
    }
  }
}

walk(dir);
