const fs = require('fs');
const path = require('path');

function applyFromIssue(eventPath) {
  const evt = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const body = evt.issue?.body || '';
  // File blocks look like:
  // ```file:relative/path/to/file.ext
  // <file contents>
  // ```
  const re = /```file:([^\n\r]+)\s+([\s\S]*?)```/g;
  let m, changed = 0;
  while ((m = re.exec(body)) !== null) {
    const file = m[1].trim();
    const content = m[2].replace(/\r\n/g, '\n');
    const full = path.resolve(process.cwd(), file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    console.log('Wrote', file);
    changed++;
  }
  console.log(`Total files written: ${changed}`);
}
applyFromIssue(process.argv[2]);
