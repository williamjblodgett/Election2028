/** Align every strategic marker to the same projection as the offline boundaries. */
(() => {
    const WS=window.WorldSystem, G=window.WorldGeometry;
    if (!G) return;
    const ids={canada:'CAN',mexico:'MEX',brazil:'BRA',argentina:'ARG',uk:'GBR',france:'FRA',germany:'DEU',poland:'POL',ukraine:'UKR',russia:'RUS',turkey:'TUR',israel:'ISR',egypt:'EGY',nigeria:'NGA',southafrica:'ZAF',saudi:'SAU',iran:'IRN',india:'IND',pakistan:'PAK',bangladesh:'BGD',china:'CHN',nkorea:'PRK',skorea:'KOR',japan:'JPN',taiwan:'TWN',vietnam:'VNM',thailand:'THA',indonesia:'IDN',philippines:'PHL',australia:'AUS',newzealand:'NZL',ethiopia:'ETH',congo:'COD'};
    WS.LAND_PATHS=G.features.map(f=>f.d);
    WS.NATIONS.forEach(n=>{
        const f=G.features.find(f=>f.id===ids[n.id]);
        if (!f) throw new Error(`Missing geographic identity: ${n.name}`);
        Object.assign(n,{geoId:f.id,x:f.x,y:f.y,population:f.population,populationYear:f.populationYear});
    });
    WS.home=G.features.find(f=>f.id==='USA');
})();
