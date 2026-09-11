const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
global.window=globalThis;
for(const name of ['random','constants','candidates','states','vp-data','events','debate-system','debate-content','debate-expanded','debate-scenarios','engine','campaign-finance','game-commands','opponent-campaign','save-store','career-system','campaign-depth','world','world-geometry','geography','war','presidency','simulation','election-system','narrative-director','cabinet','politicians-expanded','legends','people','interviews','debate-round']) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../js',`${name}.js`),'utf8'),{filename:`js/${name}.js`});
}
