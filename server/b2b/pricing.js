export function calculateSellingPrice(net, pax, type, markup, discount=0) {
  const values=[net,pax,markup,discount].map(Number);
  if(values.some(v=>!Number.isFinite(v))||values[0]<0||!Number.isInteger(values[1])||values[1]<1||values[1]>200||values[2]<0||values[3]<0||!["percentage","fixed"].includes(type)||(type==="percentage"&&values[2]>100))throw new Error("Invalid package price, traveller count or markup");
  const agentCost=Math.round(values[0]*values[1]*100)/100;
  const subtotal=Math.round((agentCost+(type==="fixed"?values[2]:agentCost*values[2]/100))*100)/100;
  const total=Math.round((subtotal-values[3])*100)/100;
  if(!Number.isFinite(total)||total<0||subtotal>9999999999)throw new Error("Invalid selling total");
  return {agentCost,subtotal,total};
}
export function currentRate(rates,today=new Date().toISOString().slice(0,10)) {
  return rates.find(r=>r.active!==false&&(!r.valid_from||r.valid_from<=today)&&(!r.valid_until||r.valid_until>=today));
}
