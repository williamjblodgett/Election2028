// Reproducible Pages artifact: only runtime files, never tests or dependencies.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'), out=path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','manifest.json','service-worker.js','js','css','images','icons']) {
    fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
}
const commit=process.env.GITHUB_SHA || execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify({commit,saveVersion:4,built:new Date().toISOString()},null,2));
const sw=path.join(out,'service-worker.js');
fs.writeFileSync(sw,fs.readFileSync(sw,'utf8').replace(/const CACHE_NAME = '[^']+';/,`const CACHE_NAME = 'election2028-${commit}';`));
console.log(`Pages artifact: ${commit}`);
