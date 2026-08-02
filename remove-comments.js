import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import stripComments from 'strip-comments';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exts = ['.ts', '.tsx', '.js', '.jsx', '.css'];
const ignoredDirs = ['node_modules', 'dist', '.git', '.wrangler'];

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!ignoredDirs.includes(file)) {
                walk(fullPath);
            }
        } else {
            const ext = path.extname(fullPath);
            if (exts.includes(ext)) {
                try {
                    let content = fs.readFileSync(fullPath, 'utf8');
                    let stripped = stripComments(content);
                    if (content !== stripped) {
                        fs.writeFileSync(fullPath, stripped);
                        console.log('Stripped comments from ' + fullPath);
                    }
                } catch (e) {
                    console.error('Failed to process ' + fullPath + ':', e);
                }
            } else if (file === '.gitignore') {
                try {
                    let content = fs.readFileSync(fullPath, 'utf8');
                    let lines = content.split('\n');
                    let newLines = lines.filter(line => !line.trim().startsWith('#'));
                    let newContent = newLines.join('\n');
                    if (content !== newContent) {
                        fs.writeFileSync(fullPath, newContent);
                        console.log('Stripped comments from ' + fullPath);
                    }
                } catch (e) {
                    console.error('Failed to process ' + fullPath + ':', e);
                }
            }
        }
    }
}

walk(__dirname);
