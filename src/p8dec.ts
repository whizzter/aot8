import * as fs from "fs";
import { PNG  } from "pngjs";

export const readP8 = (fn:string)=>{
	if (fn.toLowerCase().endsWith(".p8.png")) {
		const bytes = fs.readFileSync(fn);
		const img = PNG.sync.read(bytes);
		
		if (img.width!=160 || img.height!=205)
			throw new Error("Not a P8 png");
		
		const stegBytes = new Uint8Array(32773);
		for (let i=0;i<stegBytes.length;i++) {
			let idx = i<<2;
			stegBytes[i]=((img.data[idx+3]&0x3)<<6)|((img.data[idx+0]&0x3)<<4)|((img.data[idx+1]&0x3)<<2)|(img.data[idx+2]&0x3);
		}
	
		let src:string;
		if (stegBytes[0x4300]==0 && stegBytes[0x4301]==0 && stegBytes[0x4302]==0 && stegBytes[0x4303]==0 && stegBytes[0x4304]==112 ) {
			throw new Error("New fmt not supported!");
		} else if (stegBytes[0x4300]==0x3a && stegBytes[0x4301]==0x63 && stegBytes[0x4302]==0x3a && stegBytes[0x4303]==0) {
			let len = (stegBytes[0x4304]<<8)|stegBytes[0x4305];
			let obuf = new Uint8Array(len);
			let oi=0,ii=0x4308;
			while(oi<len) {
				if (ii>=stegBytes.length)
					throw new Error("Error in encoded data");
				let ebyte = stegBytes[ii++];
				if (ebyte==0) {
					obuf[oi++]=stegBytes[ii++];
				} else if (ebyte>=1 && ebyte<=0x3b) {
					obuf[oi++]="\n 0123456789abcdefghijklmnopqrstuvwxyz!#%(){}[]<>+=/*:;.,~_".charCodeAt(ebyte-1);
				} else {
					ebyte-=0x3c;
					let nb = stegBytes[ii++];
					let offset = ebyte*16 + (nb&0xf);
					let len = (nb>>4)+2;
					while(len>0) {
						obuf[oi]=obuf[oi-offset];
						oi++;
						len--;
					}
				}
			}
			src = Buffer.from(obuf).toString("ascii");
		} else {
			let idx=0x4300;
			while(idx<stegBytes.length && stegBytes[idx]!=0)
				idx++;
			src=Buffer.from(stegBytes.slice(0x4300,idx)).toString("ascii");		
		}
	
		let data = stegBytes.slice(0,0x4300);
		// fs.writeFileSync("test.steg",stegBytes);
		// fs.writeFileSync("test.bin",data);
		// fs.writeFileSync("test.lb",stegBytes.slice(0x4300));
		// fs.writeFileSync("test.lua",src);
		return {data,src}
	} else {
		throw new Error("Needs a .p8.png file")
	}
}


//readP8("examples/Pico8Platformer/platformer.p8.png");
//readP8("examples/13021.p8.png");