const fs = require('fs');

const path = './src/app/member/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove localized skeletons
content = content.replace(/\{loading \? <Skeleton[^>]+> : \(/g, '');
content = content.replace(/\s*\)\}\s*/g, (match, offset, string) => {
  // We only want to remove `)}` that used to close the skeleton ternary.
  // Actually, this is risky. Let's do it manually with multi_replace_file_content but in very tight chunks.
  return match;
});
