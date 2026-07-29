const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix ListItemText primaryTypographyProps
  if (content.includes('primaryTypographyProps')) {
    content = content.replace(/<ListItemText\s+primary=\{([^}]+)\}\s+primaryTypographyProps=\{\{([^}]+)\}\}\s*\/>/g, (match, primary, props) => {
      changed = true;
      return `<ListItemText primary={<Typography sx={{${props}}}>{${primary}}</Typography>} />`;
    });
    content = content.replace(/<ListItemText\s+primary="([^"]+)"\s+primaryTypographyProps=\{\{([^}]+)\}\}\s*\/>/g, (match, primary, props) => {
      changed = true;
      return `<ListItemText primary={<Typography sx={{${props}}}>${primary}</Typography>} />`;
    });
  }

  // Move alignItems, justifyContent, flexWrap to sx prop
  const propsToMove = ['alignItems', 'justifyContent', 'flexWrap'];
  
  for (const prop of propsToMove) {
    content = content.replace(/<([A-Z][a-zA-Z0-9_]*)([^>]*?)>/g, (match, tag, attrs) => {
      if (tag === 'Typography' || tag === 'Divider' || tag === 'Button') return match;

      let newAttrs = attrs;
      let sxToAdd = [];
      let attrChanged = false;

      for (const p of propsToMove) {
        // match string value or object value like {{ ... }}
        const pRegex = new RegExp(`\\s+${p}=(?:"([^"]+)"|(\\{\\{.*?\\}\\}))`);
        const pMatch = newAttrs.match(pRegex);
        if (pMatch) {
          attrChanged = true;
          // if it's a string, we wrap it in quotes. If it's an object, we take the inner content.
          let val;
          if (pMatch[1]) {
             val = `'${pMatch[1]}'`;
          } else if (pMatch[2]) {
             val = pMatch[2].slice(1, -1); // remove outer {} to merge into sx={}
          }
          sxToAdd.push(`${p}: ${val}`);
          newAttrs = newAttrs.replace(pMatch[0], '');
        }
      }

      if (attrChanged) {
        changed = true;
        const sxMatch = newAttrs.match(/sx=\{\{\s*(.*?)\s*\}\}/);
        if (sxMatch) {
          const newSx = sxMatch[1] ? `${sxMatch[1]}, ${sxToAdd.join(', ')}` : sxToAdd.join(', ');
          newAttrs = newAttrs.replace(sxMatch[0], `sx={{ ${newSx} }}`);
        } else {
          newAttrs += ` sx={{ ${sxToAdd.join(', ')} }}`;
        }
        return `<${tag}${newAttrs}>`;
      }
      return match;
    });
  }

  // Remove `item` from Grid
  if (content.includes('item') && content.includes('Grid')) {
    const original = content;
    content = content.replace(/<Grid([^>]*?)\sitem(\s|>)/g, '<Grid$1$2');
    content = content.replace(/<Grid([^>]*?)\sitem=\{true\}(\s|>)/g, '<Grid$1$2');
    if (original !== content) changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(directoryPath);
