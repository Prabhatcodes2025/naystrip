// Titles and durations supplied by the owner; other content comes from the CMS/catalogue.
export const pickGroups=["Travel Picks","Adventure Picks","Weekend Treks & Getaways – Maharashtra","Himalaya Treks & Expeditions"];
export const monthlyPicks=[
 [0,"Kashmir","5N/6D"],[0,"Puri Orissa","3N/4D"],[0,"Munnar Kerala","6N/7D"],
 [1,"Spiti Valley","6N/7D"],[1,"Sikkim & Darjeeling","6N/7D"],[1,"Leh Ladakh","8N/9D"],
 [2,"Kalu Waterfall Trek"],[2,"Waterfall Rappelling"],[2,"Off Beat Trek Maharashtra"],[2,"Kaas Plateau"],[2,"Garbett Plateau"],
 [3,"Kashmir Great Lake Trek","","kashmir-great-lakes"],[3,"Mt Yunum Expedition","","mount-yunum"],[3,"Kang Yatse II","","kang-yatse"],[3,"Friendship Peak","","friendship-peak"],[3,"Valley of Flowers Trek","","valley-of-flowers"],[3,"Pindari Glacier Trek","","pindari-glacier"],[3,"Tungnath Chandrashila Trek"],
].map(([group,title,duration="",slug=""],index)=>({id:`september-${index}`,group,title,duration,slug,image:"",active:true}));
