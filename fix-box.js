const fs = require('fs');
const path = require('path');

const SYSTEM_PROPS = ['display', 'justifyContent', 'alignItems', 'flexDirection', 'flexWrap', 'flex', 'flexGrow', 'flexShrink', 'minWidth', 'height', 'width', 'mb', 'mt', 'pt', 'pb', 'px', 'py', 'p', 'm', 'gap', 'textAlign', 'mr', 'ml', 'mx', 'my'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Find all <Box ...> tags
  // This regex matches <Box followed by attributes until >
  const boxRegex = /<Box\s+([^>]+)>/g;
  
  content = content.replace(boxRegex, (match, attrsString) => {
    // Check if it has any system props
    let hasSystemProp = false;
    let sxProps = [];
    let otherAttrs = [];
    
    // We use a regex to match attribute key=value pairs or key={value}
    // and correctly handle curly braces inside
    
    // This is a simplified parser. It splits by spaces outside of quotes/curlies.
    // Let's use a simpler approach: 
    // We match `prop={val}` or `prop="val"`
    
    const attrRegex = /([a-zA-Z0-9]+)=({[^}]+}|"[^"]*"|'[^']*')/g;
    
    let newAttrsString = attrsString;
    let matchAttr;
    
    let currentSx = null;
    
    // First find if there's already an sx prop
    const sxMatch = attrsString.match(/sx={({[^}]+})}/);
    if (sxMatch) {
      currentSx = sxMatch[1]; // e.g. "{ display: 'flex' }"
    }
    
    let remainingAttrs = [];
    let extractedSxProps = [];

    // Reset regex
    attrRegex.lastIndex = 0;
    while ((matchAttr = attrRegex.exec(attrsString)) !== null) {
      const propName = matchAttr[1];
      let propValue = matchAttr[2]; // can be "{value}", '"value"', "'value'"
      
      if (SYSTEM_PROPS.includes(propName)) {
        hasSystemProp = true;
        // Convert value to JS value for sx object
        let jsValue;
        if (propValue.startsWith('{')) {
          jsValue = propValue.slice(1, -1);
        } else {
          jsValue = propValue; // it's already a string with quotes
        }
        extractedSxProps.push(`${propName}: ${jsValue}`);
      } else if (propName !== 'sx') {
        remainingAttrs.push(matchAttr[0]);
      }
    }
    
    // Also handle boolean props like `hidden` which are matched differently
    // Actually, just find the whole string, replace matched attrs with empty string, then add remaining
    if (hasSystemProp) {
      let finalSxString = '';
      if (currentSx) {
        // remove outer curlies
        let innerSx = currentSx.slice(1, -1).trim();
        finalSxString = `{ ${innerSx}${innerSx.endsWith(',') || innerSx === '' ? '' : ', '} ${extractedSxProps.join(', ')} }`;
      } else {
        finalSxString = `{ ${extractedSxProps.join(', ')} }`;
      }
      
      changed = true;
      
      // Also need to keep boolean props like `hidden` that weren't caught by key=val
      // Let's just remove the matched key=value from the original string
      let leftover = attrsString;
      attrRegex.lastIndex = 0;
      while ((matchAttr = attrRegex.exec(attrsString)) !== null) {
        if (SYSTEM_PROPS.includes(matchAttr[1]) || matchAttr[1] === 'sx') {
          leftover = leftover.replace(matchAttr[0], '');
        }
      }
      
      return `<Box ${leftover.trim()} sx={${finalSxString}}>`.replace(/\s+/g, ' ');
    }
    
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDir(path.join(__dirname, 'src/app'));
processFile(path.join(__dirname, 'src/components/AppLayout.tsx'));
processFile(path.join(__dirname, 'src/components/Header.tsx'));
processFile(path.join(__dirname, 'src/components/Sidebar.tsx'));
