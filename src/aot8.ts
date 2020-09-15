import * as fs from 'fs';
import * as luaparse from 'luaparse'
import { readP8 } from "./p8dec";

let fn = "examples/Pico8Platformer/platformer.p8.png";
// let fn = 'examples/Pico8Platformer/platformer.lua';
let source:string;


if (fn.toLowerCase().endsWith(".lua")) {
	source = fs.readFileSync(fn,'ascii');
	const p8headRE = /(?<head>.*?^__lua__$)(?<src>.*)/ms;
	// TODO: only handling external lua for now, make it possible to handle "internal" also.
	const rres = p8headRE.exec(source);
	if (rres) {
		// if we match the lua header stuff we will replace any white-space before and including the lua head with 
		// whitespace so that line-numbers are intact.
		source = rres!.groups!.head.replace(/[^ \r\n\t]/g," ")+rres!.groups!.src;
		//console.log("Match:",rres.groups);
	}
} else if (fn.toLowerCase().endsWith(".p8.png")) {
	const cart = readP8(fn);
	source = cart.src;
} else {
	throw new Error("Invalid Filename:"+fn);
}
//console.log("Src:\n"+source);

const ast = luaparse.parse(source,{luaVersion:'P8' as any});

console.log(ast);
