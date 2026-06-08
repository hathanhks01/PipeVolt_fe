const fs = require('fs');
const path = require('path');

const rootDir = __dirname; // hoặc path.join(__dirname, 'frontend') / path.join(__dirname, 'backend')
const outputFile = path.join(rootDir, 'chat_code_for_review.txt');

const excludeDirs = ['node_modules', 'bin', 'obj', '.git', '.vs', 'dist', 'build', 'out', 'Properties', 'Migrations'];
const includeExts = ['.cs', '.js', '.jsx', '.ts', '.tsx', '.json'];

const keywords = [
  'chat', 'signalr', 'chathub', 'ChatService', 'ChatWidget',
  'ChatRoom', 'UserTyping', 'UserStoppedTyping', 'MessageRead',
  'HubConnection', 'ChatHub'
];

function containsKeyword(filePath, content) {
  const lowerPath = filePath.toLowerCase();
  if (keywords.some(k => lowerPath.includes(k.toLowerCase()))) return true;
  const lowerContent = content.toLowerCase();
  return keywords.some(k => lowerContent.includes(k.toLowerCase()));
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        results = results.concat(walk(filePath));
      }
    } else {
      if (includeExts.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

try {
  const files = walk(rootDir);
  let outputContent = '';

  files.forEach(file => {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      return;
    }

    if (!containsKeyword(file, content)) return;

    outputContent += `\n================================================================================\n`;
    outputContent += `File: ${file.replace(rootDir, '')}\n`;
    outputContent += `================================================================================\n\n`;
    outputContent += content + '\n';
  });

  fs.writeFileSync(outputFile, outputContent, 'utf8');
  console.log(`✅ Export chat realtime code xong: ${outputFile}`);
} catch (e) {
  console.error('Lỗi:', e);
}