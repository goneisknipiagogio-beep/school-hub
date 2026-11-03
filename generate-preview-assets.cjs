// Run `node generate-preview-assets.cjs` in this directory (requires sharp).
// Text and positioning are edited in og-image.source.svg; artwork stays in school.svg.
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
async function main(){
 const template=await fs.readFile(path.join(__dirname,'og-image.source.svg'),'utf8');
 const school=await fs.readFile(path.join(__dirname,'school.svg'),'utf8');
 const illustration=school.replace('<svg ','<svg x="515" y="140" width="630" height="362" ');
 const og=template.replace('<!-- SCHOOL_ARTWORK -->',illustration);
 await sharp(Buffer.from(og)).png({compressionLevel:9,palette:true,quality:100}).toFile(path.join(__dirname,'og-image.png'));
 const logo='<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" rx="38" fill="#e6edda"/><svg x="38" y="38" width="104" height="104" viewBox="0 0 24 24" fill="none" stroke="#24594d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/></svg></svg>';
 await fs.writeFile(path.join(__dirname,'favicon.svg'),logo);
 await sharp(Buffer.from(logo)).resize(32,32).png({compressionLevel:9}).toFile(path.join(__dirname,'favicon.png'));
 await sharp(Buffer.from(logo)).png({compressionLevel:9}).toFile(path.join(__dirname,'apple-touch-icon.png'));
 for(const name of ['og-image.png','favicon.png','apple-touch-icon.png']){
  const file=path.join(__dirname,name),meta=await sharp(file).metadata(),stat=await fs.stat(file);
  if(name==='og-image.png'&&(meta.width!==1200||meta.height!==630||stat.size>=300000))throw Error('Preview image does not meet size requirements');
  console.log(name+': '+meta.width+'×'+meta.height+', '+stat.size+' bytes');
 }
}
main().catch(error=>{console.error(error);process.exitCode=1});




