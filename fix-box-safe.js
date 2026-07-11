const fs = require('fs');
const path = require('path');

function replaceFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Simple hardcoded replacements based on common patterns
  content = content.replace(/<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>/g, '<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>');
  content = content.replace(/<Box display="flex" gap={(\d+(?:\.\d+)?)} alignItems="center" mb={2}>/g, '<Box sx={{ display: "flex", gap: $1, alignItems: "center", mb: 2 }}>');
  content = content.replace(/<Box display="flex" gap={(\d+(?:\.\d+)?)} mt={2}>/g, '<Box sx={{ display: "flex", gap: $1, mt: 2 }}>');
  content = content.replace(/<Box display="flex" flexDirection="column" gap={(\d+(?:\.\d+)?)}>/g, '<Box sx={{ display: "flex", flexDirection: "column", gap: $1 }}>');
  content = content.replace(/<Box display="flex" flexDirection="column" gap={(\d+(?:\.\d+)?)} mt={(\d+(?:\.\d+)?)}>/g, '<Box sx={{ display: "flex", flexDirection: "column", gap: $1, mt: $2 }}>');
  content = content.replace(/<Box flex={1}>/g, '<Box sx={{ flex: 1 }}>');
  content = content.replace(/<Box display="flex" justifyContent="space-between">/g, '<Box sx={{ display: "flex", justifyContent: "space-between" }}>');
  content = content.replace(/<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>/g, '<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>');
  content = content.replace(/<Box display="flex" gap={(\d+(?:\.\d+)?)}>/g, '<Box sx={{ display: "flex", gap: $1 }}>');
  content = content.replace(/<Box mt={(\d+(?:\.\d+)?)}>/g, '<Box sx={{ mt: $1 }}>');
  content = content.replace(/<Box mb={(\d+(?:\.\d+)?)}>/g, '<Box sx={{ mb: $1 }}>');
  content = content.replace(/<Box display="flex" alignItems="center" gap={(\d+(?:\.\d+)?)} mb={(\d+(?:\.\d+)?)}>/g, '<Box sx={{ display: "flex", alignItems: "center", gap: $1, mb: $2 }}>');
  content = content.replace(/<Box flexShrink={0}>/g, '<Box sx={{ flexShrink: 0 }}>');
  content = content.replace(/<Box mt={(\d+(?:\.\d+)?)} p={(\d+(?:\.\d+)?)} sx={{ ([^}]+) }}>/g, '<Box sx={{ mt: $1, p: $2, $3 }}>');
  content = content.replace(/<Box display="flex" gap={(\d+(?:\.\d+)?)} mb={(\d+(?:\.\d+)?)} flexWrap="wrap">/g, '<Box sx={{ display: "flex", gap: $1, mb: $2, flexWrap: "wrap" }}>');
  content = content.replace(/<Box display="flex" gap={(\d+(?:\.\d+)?)} flexWrap="wrap">/g, '<Box sx={{ display: "flex", gap: $1, flexWrap: "wrap" }}>');
  content = content.replace(/<Box display="flex" flexWrap="wrap" gap={(\d+(?:\.\d+)?)}>/g, '<Box sx={{ display: "flex", flexWrap: "wrap", gap: $1 }}>');
  content = content.replace(/<Box display="flex" justifyContent="flex-end" mb={2}>/g, '<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>');
  content = content.replace(/<Box display="flex" flexDirection="column" gap={(\d+(?:\.\d+)?)} alignItems="flex-end">/g, '<Box sx={{ display: "flex", flexDirection: "column", gap: $1, alignItems: "flex-end" }}>');
  content = content.replace(/<Box display="flex" flexDirection="column" alignItems="center">/g, '<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>');
  content = content.replace(/<Box display="flex" gap={(\d+(?:\.\d+)?)} alignItems="center" flexWrap="wrap">/g, '<Box sx={{ display: "flex", gap: $1, alignItems: "center", flexWrap: "wrap" }}>');
  content = content.replace(/<Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>/g, '<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>');
  content = content.replace(/<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>/g, '<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>');
  content = content.replace(/<Box display="flex" justifyContent="space-between" alignItems="center" py={2} sx={{ ([^}]+) }}>/g, '<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2, $1 }}>');
  content = content.replace(/<Box flex={1} mr={2}>/g, '<Box sx={{ flex: 1, mr: 2 }}>');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceFile(fullPath);
    }
  }
}

processDir(path.join(__dirname, 'src/app'));
