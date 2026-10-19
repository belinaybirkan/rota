/**
 * @typedef {'culture'|'food'|'nature'|'art'|'shopping'} Interest
 * @typedef {{id:string,name:string,day:number,time:string,cost:number,duration:number,category:Interest,area:string,note:string,done:boolean}} Activity
 * @typedef {{id:string,title:string,destination:string,city?:{id:string,name:string,country:string,region?:string,latitude?:number,longitude?:number},start:string,days:number,travelers:number,budget:number,pace:'slow'|'balanced'|'fast',interests:Interest[],activities:Activity[]}} Trip
 * Maliyet: kişi başı EUR. Seyahat bütçesi: tüm kişiler için toplam EUR.
 */
export {};
