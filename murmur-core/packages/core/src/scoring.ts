export const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n));
export const avg=(xs:number[])=>xs.reduce((a,b)=>a+b,0)/(xs.length||1);