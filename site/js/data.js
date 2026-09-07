// Contenuto del viaggio + piccole funzioni di supporto usate anche dall'app.
// Modifica qui per aggiornare l'itinerario, senza toccare la logica dell'app.

  function defaultDays(){
    function it(time,title,note,opts){
      opts = opts||{};
      return {id:uid(),time:time,title:title,note:note||"",link:opts.link||"",top:!!opts.top,transport:!!opts.transport,status:""};
    }
    return [
      {date:"13/09",wd:"dom",city:"Viaggio",items:[
        it("11:20","Milano Malpensa → Tokyo Haneda","Volo NH0208 All Nippon Airways. Arrivo HND il 14/09 alle 07:20. Bagaglio in stiva incluso.",{link:"https://www.google.com/maps/search/?api=1&query=Milano+Malpensa+Airport",transport:true}),
      ]},
      {date:"14/09",wd:"lun",city:"Kyoto",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Mitsui+Garden+Hotel+Kyoto+Shijo&destination=Kamo+River+Gion+Kyoto&waypoints=Ninenzaka+Kyoto%7CYasaka+Pagoda+Kyoto%7CYasaka+Shrine+Kyoto%7CHanamikoji+Street+Kyoto%7CGion+Shirakawa+Kyoto",label:"Itinerario completo 14/09",note:""}],items:[
        it("07:20","Tokyo Haneda Airport","Arrivo in Giappone. Immigrazione, bagagli e trasferimento verso il volo interno. Oltre 4h di margine",{link:"https://www.google.com/maps/search/?api=1&query=Tokyo+Haneda+Airport"}),
        it("12:00–13:30","Haneda → Osaka Kansai","Volo NH3823 All Nippon Airways.",{link:"https://www.google.com/maps/search/?api=1&query=Kansai+International+Airport",transport:true}),
        it("13:30–~16:15","KIX → Kyoto","Pacchetto Kansai Welcome in italiano già incluso: assistenza in aeroporto, trasporto pubblico fino a Kyoto e taxi finale verso l’hotel. Molto comodo dopo il lungo viaggio",{transport:true}),
        it("~16:15–16:45","Mitsui Garden Hotel Kyoto Shijo","Check-in. Base per 3 notti. Posizione centrale",{link:"https://www.google.com/maps/search/?api=1&query=Mitsui+Garden+Hotel+Kyoto+Shijo"}),
        it("17:15–17:45","Ninenzaka / Sannenzaka","Vie sempre accessibili; alcuni negozi possono iniziare a chiudere. Visita soprattutto atmosferica.",{link:"https://www.google.com/maps/search/?api=1&query=Ninenzaka+Kyoto"}),
        it("17:45","Yasaka Pagoda / Hōkan-ji","Esterno sempre visibile; non è indispensabile entrare. Ottima luce serale",{link:"https://www.google.com/maps/search/?api=1&query=Yasaka+Pagoda+Kyoto"}),
        it("18:15","Yasaka Shrine","Santuario accessibile anche la sera; servizi e uffici hanno orari diurni.",{link:"https://www.google.com/maps/search/?api=1&query=Yasaka+Shrine+Kyoto"}),
        it("18:45","Gion / Hanamikoji","Quartiere sempre accessibile. Uno dei momenti migliori per vederlo",{link:"https://www.google.com/maps/search/?api=1&query=Hanamikoji+Street+Kyoto"}),
        it("19:15","Gion Shirakawa","Passeggiata lungo il canale.",{link:"https://www.google.com/maps/search/?api=1&query=Gion+Shirakawa+Kyoto"}),
        it("19:30 →","Kamo River + cena","Nessun’altra visita impegnativa.",{link:"https://www.google.com/maps/search/?api=1&query=Kamo+River+Gion+Kyoto"}),
      ]},
      {date:"15/09",wd:"mar",city:"Kyoto",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Mitsui+Garden+Hotel+Kyoto+Shijo&destination=Mitsui+Garden+Hotel+Kyoto+Shijo&waypoints=Kiyomizu-dera+Kyoto%7CSannenzaka+Kyoto%7CKodaiji+Temple+Kyoto%7CNijo+Castle+Kyoto%7CNishiki+Market+Kyoto%7CGion+Kyoto%7CPontocho+Kyoto",label:"Itinerario completo 15/09",note:""}],items:[
        it("06:30–06:45","Hotel → Kiyomizu-dera","Taxi consigliabile per guadagnare tempo.",{transport:true}),
        it("07:00–08:30","Kiyomizu-dera","In settembre normalmente 06:00–18:00. ⭐ Must-have; alle 07:00 molta meno folla",{link:"https://www.google.com/maps/search/?api=1&query=Kiyomizu-dera+Kyoto",top:true}),
        it("08:30–09:30","Sannenzaka / Ninenzaka","Strade sempre accessibili; negozi aprono progressivamente.",{link:"https://www.google.com/maps/search/?api=1&query=Sannenzaka+Kyoto"}),
        it("09:45–10:45","Kodai-ji","Circa 09:00–17:30, ultimo ingresso ~17:00.",{link:"https://www.google.com/maps/search/?api=1&query=Kodaiji+Temple+Kyoto"}),
        it("11:00–11:45","Maruyama Park + Yasaka Shrine","Parco sempre accessibile.",{link:"https://www.google.com/maps/search/?api=1&query=Maruyama+Park+Kyoto"}),
        it("12:00–13:00","Pranzo","—"),
        it("13:30–15:15","Nijō Castle","Ingresso generale ~08:45–16:00; complesso fino alle 17:00. ⭐ Da mantenere",{link:"https://www.google.com/maps/search/?api=1&query=Nijo+Castle+Kyoto",top:true}),
        it("15:30–16:30","Nishiki Market","Orari negozio per negozio; molti chiudono verso le 17:00–18:00. Fascia corretta",{link:"https://www.google.com/maps/search/?api=1&query=Nishiki+Market+Kyoto"}),
        it("17:00–18:15","Gion","Quartiere sempre accessibile.",{link:"https://www.google.com/maps/search/?api=1&query=Gion+Kyoto"}),
        it("18:30 →","Pontocho + Kamo River","Cena e passeggiata serale.",{link:"https://www.google.com/maps/search/?api=1&query=Pontocho+Kyoto"}),
      ]},
      {date:"16/09",wd:"mer",city:"Nara · Osaka",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Nara+Park+Japan&destination=Naramachi+Nara&waypoints=Kasuga+Taisha+Nara%7CTodaiji+Temple+Nara%7CNigatsu-do+Nara",label:"Itinerario NARA",note:""},{url:"https://www.google.com/maps/dir/?api=1&origin=Osaka+Castle&destination=JR+Osaka+Station&waypoints=Shinsekai+Osaka%7CDotonbori+Osaka",label:"Itinerario OSAKA",note:""}],items:[
        it("~07:00","Kyoto → Nara","Partenza presto dall’hotel.",{transport:true}),
        it("08:15–09:00","Nara Park","Sempre accessibile.",{link:"https://www.google.com/maps/search/?api=1&query=Nara+Park+Japan"}),
        it("09:00–10:00","Kasuga Taisha","Settembre: circa 06:30–17:30.",{link:"https://www.google.com/maps/search/?api=1&query=Kasuga+Taisha+Nara"}),
        it("10:30–12:00","Todai-ji","Aprile–ottobre: Daibutsuden circa 07:30–17:30. ⭐ Must-have",{link:"https://www.google.com/maps/search/?api=1&query=Todaiji+Temple+Nara",top:true}),
        it("12:00–12:45","Nigatsu-do","Vicinissimo al Todai-ji.",{link:"https://www.google.com/maps/search/?api=1&query=Nigatsu-do+Nara"}),
        it("13:00–14:00","Pranzo + Naramachi opzionale","Da sacrificare se Nara richiede più tempo. 🟡",{link:"https://www.google.com/maps/search/?api=1&query=Naramachi+Nara"}),
        it("~14:15","Nara → Osaka","Collegamento verso Namba/Osaka.",{transport:true}),
        it("15:30–17:00","Osaka Castle – opzionale","Museo ~09:00–18:00; ultimo ingresso ~17:30. 🟡 Prima tappa da eliminare se c’è ritardo",{link:"https://www.google.com/maps/search/?api=1&query=Osaka+Castle"}),
        it("17:30–18:15","Shinsekai","Quartiere sempre accessibile.",{link:"https://www.google.com/maps/search/?api=1&query=Shinsekai+Osaka"}),
        it("18:45–20:00","Dotonbori / Namba","Glico, canale, insegne, atmosfera serale. ⭐ Visita da terminare entro le 20:00",{link:"https://www.google.com/maps/search/?api=1&query=Dotonbori+Osaka",top:true}),
        it("20:00–20:30","Cena Dotonbori/Namba","Cena non oltre le 20:30."),
        it("20:30–21:00","Dotonbori → JR Osaka Station","Trasferimento verso Umeda. Molto prudente",{link:"https://www.google.com/maps/search/?api=1&query=JR+Osaka+Station",transport:true}),
        it("~21:00–21:30","Osaka Station → Kyoto","JR Kyoto Line; preferire Special Rapid diretto. Nessun rischio di ultimo treno",{link:"https://www.google.com/maps/search/?api=1&query=Kyoto+Station",transport:true}),
        it("~22:00","Mitsui Garden Hotel Kyoto Shijo","Rientro.",{link:"https://www.google.com/maps/search/?api=1&query=Mitsui+Garden+Hotel+Kyoto+Shijo"}),
      ]},
      {date:"17/09",wd:"gio",city:"Kyoto → Ryokan",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Mitsui+Garden+Hotel+Kyoto+Shijo&destination=Seikoro+Ryokan+Kyoto&waypoints=Fushimi+Inari+Taisha+Kyoto%7CTenryuji+Kyoto%7CArashiyama+Bamboo+Forest+Kyoto%7CTogetsukyo+Bridge+Kyoto%7CRyoanji+Kyoto%7CKinkaku-ji+Kyoto",label:"Itinerario completo 17/09",note:""}],items:[
        it("~06:15","Check-out Mitsui / bagagli","Chiedere alla reception di organizzare il trasferimento bagagli verso Seikoro. Evitare di trascinarli durante la giornata. ⚠️ Da organizzare la sera prima"),
        it("06:30–08:30","Fushimi Inari Taisha","Area dei torii accessibile molto presto. Non serve arrivare in cima. ⭐ Must-have",{link:"https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Taisha+Kyoto",top:true}),
        it("09:30–10:30","Tenryū-ji","~08:30–17:00.",{link:"https://www.google.com/maps/search/?api=1&query=Tenryuji+Kyoto"}),
        it("10:30–11:15","Arashiyama Bamboo Grove","Sempre accessibile. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Arashiyama+Bamboo+Forest+Kyoto",top:true}),
        it("11:15–12:00","Togetsukyo Bridge","Area pubblica sempre accessibile.",{link:"https://www.google.com/maps/search/?api=1&query=Togetsukyo+Bridge+Kyoto"}),
        it("12:00–12:40","Pranzo rapido","Evitare un pranzo lungo."),
        it("13:00–14:00","Ryōan-ji","Marzo–novembre ~08:00–17:00. ⭐ Must-have: giardino zen",{link:"https://www.google.com/maps/search/?api=1&query=Ryoanji+Kyoto",top:true}),
        it("14:10–15:00","Kinkaku-ji","09:00–17:00. ⭐ Must-have",{link:"https://www.google.com/maps/search/?api=1&query=Kinkaku-ji+Kyoto",top:true}),
        it("15:00–15:45","Kinkaku-ji → Seikoro Ryokan","Taxi consigliato. Riduce parecchio lo stress",{transport:true}),
        it("~15:45 → sera","Seikoro Ryokan","Check-in, relax, bagno/onsen e cena kaiseki. ⭐ Da qui STOP visite",{link:"https://www.google.com/maps/search/?api=1&query=Seikoro+Ryokan+Kyoto",top:true}),
      ]},
      {date:"18/09",wd:"ven",city:"Kyoto → Kanazawa",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=KOKO+HOTEL+Premier+Kanazawa+Korinbo&destination=KOKO+HOTEL+Premier+Kanazawa+Korinbo&waypoints=Higashi+Chaya+District+Kanazawa%7CKazuemachi+Chaya+District+Kanazawa",label:"Itinerario completo 18/09",note:"JR Pass attivo dal 18/09"}],items:[
        it("Mattina","Seikoro Ryokan","Colazione e check-out.",{link:"https://www.google.com/maps/search/?api=1&query=Seikoro+Ryokan+Kyoto"}),
        it("~09:45–10:30","Trasferimento verso Tondaya","Presentarsi almeno 15 minuti prima.",{link:"https://www.google.com/maps/search/?api=1&query=Tondaya+Kyoto",transport:true}),
        it("10:45","Tondaya – arrivo","Check-in esperienza."),
        it("11:00–~12:30","Cerimonia del tè + kimono","Primo slot disponibile scelto: 11:00. Durata prudenziale 1–1,5h. ⭐ Esperienza prioritaria",{link:"https://www.google.com/maps/search/?api=1&query=Tondaya+Kyoto",top:true}),
        it("~12:30–13:30","Bagagli → Kyoto Station","Trasferimento urbano verso Kyoto Station. Il JR Pass non copre taxi, metro o bus urbani non-JR: eventuale costo separato. JR Pass non rilevante per questo tratto urbano",{link:"https://www.google.com/maps/search/?api=1&query=Kyoto+Station",transport:true}),
        it("prima del treno","Attivazione Japan Rail Pass","JR Pass Ordinary 7 giorni: 18/09 → 24/09 compreso. Ottima finestra di utilizzo"),
        it("~14:00–16:30","Kyoto → Tsuruga → Kanazawa","Thunderbird Kyoto → Tsuruga + Hokuriku Shinkansen Tsuruga → Kanazawa. Entrambi i tratti sono coperti dal Japan Rail Pass Ordinary valido dal 18/09: non serve acquistare un biglietto ferroviario separato. È consigliato prenotare i posti con il JR Pass; per i posti ordinari coperti non è previsto supplemento. Interamente coperto dal JR Pass",{link:"https://www.google.com/maps/search/?api=1&query=Kanazawa+Station",transport:true}),
        it("~16:45–17:15","KOKO HOTEL Premier Kanazawa Korinbo","Check-in.",{link:"https://www.google.com/maps/search/?api=1&query=KOKO+HOTEL+Premier+Kanazawa+Korinbo"}),
        it("17:30–18:30","Higashi Chaya District","Visita principalmente atmosferica; negozi/case da tè possono essere già in chiusura.",{link:"https://www.google.com/maps/search/?api=1&query=Higashi+Chaya+District+Kanazawa"}),
        it("18:30–19:00","Asano River + Kazuemachi","Perfetti al tramonto/sera.",{link:"https://www.google.com/maps/search/?api=1&query=Kazuemachi+Chaya+District+Kanazawa"}),
        it("19:30 →","Cena Kanazawa","Puntare sul pesce del Mar del Giappone."),
      ]},
      {date:"19/09",wd:"sab",city:"Kanazawa → Takayama",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=KOKO+HOTEL+Premier+Kanazawa+Korinbo&destination=TOKYU+STAY+Hida-Takayama+Musubi+no+Yu&waypoints=Kenrokuen+Kanazawa%7CKanazawa+Castle%7CKanazawa+Station%7CShirakawa-go+Ogimachi",label:"Itinerario completo 19/09",note:"Nessun biglietto JR da acquistare per i bus; usare i voucher inclusi"}],items:[
        it("07:15–08:15","Kenroku-en","Mattina presto. ⭐ Must-have",{link:"https://www.google.com/maps/search/?api=1&query=Kenrokuen+Kanazawa",top:true}),
        it("08:15–08:45","Kanazawa Castle / esterni","Visita volutamente breve.",{link:"https://www.google.com/maps/search/?api=1&query=Kanazawa+Castle"}),
        it("~08:45–09:15","Hotel → Kanazawa Station","Recupero bagagli e trasferimento verso Kanazawa Station. Eventuale taxi/bus urbano non è coperto dal JR Pass. Trasferimento urbano separato dal JR Pass",{link:"https://www.google.com/maps/search/?api=1&query=Kanazawa+Station",transport:true}),
        it("Mattina","Bus Kanazawa → Shirakawago","Bus intercity non-JR. Il Japan Rail Pass non è valido su questa tratta. Il biglietto è però già incluso nel pacchetto/voucher, quindi non serve acquistarlo nuovamente. Orario definitivo da riconfermare. Non coperto dal JR Pass, ma biglietto già incluso",{link:"https://www.google.com/maps/search/?api=1&query=Shirakawa-go+Ogimachi",transport:true}),
        it("~10:30–13:30","Shirakawago / Ogimachi","Villaggio UNESCO, case gasshō-zukuri, passeggiata. ⭐⭐⭐⭐⭐",{link:"https://www.google.com/maps/search/?api=1&query=Ogimachi+Shirakawa-go",top:true}),
        it("durante la visita","Shiroyama Viewpoint","Panoramica sul villaggio. Salita a piedi o shuttle in base a tempo/energia. ⭐ Molto consigliato",{link:"https://www.google.com/maps/search/?api=1&query=Shiroyama+Viewpoint+Shirakawa-go",top:true}),
        it("~13:30–14:30","Bus Shirakawago → Takayama","Bus intercity non-JR. Il Japan Rail Pass non è valido su questa tratta. Il secondo biglietto è già incluso nel pacchetto/voucher, quindi non serve acquistarlo nuovamente. Non coperto dal JR Pass, ma biglietto già incluso",{transport:true}),
        it("~14:30–15:00","TOKYU STAY Hida-Takayama Musubi no Yu","A pochi minuti da stazione/bus center. Posizione perfetta",{link:"https://www.google.com/maps/search/?api=1&query=TOKYU+STAY+Hida-Takayama+Musubi+no+Yu"}),
        it("15:30–17:30","Sanmachi Suji / Old Town","Quartiere sempre accessibile; negozi progressivamente in chiusura verso sera.",{link:"https://www.google.com/maps/search/?api=1&query=Sanmachi+Suji+Takayama"}),
        it("19:00 →","Cena Hida Beef","Da mantenere. ⭐",{top:true}),
      ]},
      {date:"20/09",wd:"dom",city:"Takayama → Matsumoto",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=TOKYU+STAY+Hida-Takayama+Musubi+no+Yu&destination=Matsumoto+Hotel+Kagetsu&waypoints=Hirayu+Onsen%7CKamikochi+Japan%7CShin-Shimashima+Station",label:"Itinerario completo 20/09",note:"⚠️ Trasporti principali della giornata NON coperti dal JR Pass"}],items:[
        it("07:00–08:00","Miyagawa Morning Market","Mercato mattutino; perfetto prima della partenza.",{link:"https://www.google.com/maps/search/?api=1&query=Miyagawa+Morning+Market+Takayama"}),
        it("08:00–08:25","Ultima passeggiata Takayama / hotel","Recupero bagagli."),
        it("~08:30","Takayama Nohi Bus Center","A pochi minuti dall’hotel.",{link:"https://www.google.com/maps/search/?api=1&query=Takayama+Nohi+Bus+Center",transport:true}),
        it("~08:40–09:38","Takayama → Hirayu Onsen","Bus Nohi. Il Japan Rail Pass non copre questa tratta: serve biglietto/pass Nohi separato. Orario di riferimento ~08:40–09:38, da ricontrollare. ⚠️ NON coperto dal JR Pass",{link:"https://www.google.com/maps/search/?api=1&query=Hirayu+Onsen+Bus+Terminal",transport:true}),
        it("~10:00–10:30","Hirayu → Kamikochi","Bus/shuttle Nohi verso Kamikochi. Il Japan Rail Pass non è valido: serve biglietto separato. ⚠️ NON coperto dal JR Pass",{link:"https://www.google.com/maps/search/?api=1&query=Kamikochi+Japan",transport:true}),
        it("10:30–11:15","Kappa Bridge / Azusa River","Passeggiata facile. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Kappa+Bridge+Kamikochi",top:true}),
        it("11:15–13:30","Kamikochi – passeggiata","Scegliere Myojin oppure Taisho Pond in funzione di meteo/energie. Fortemente meteo-dipendente",{link:"https://www.google.com/maps/search/?api=1&query=Taisho+Pond+Kamikochi"}),
        it("13:30–14:15","Pranzo Kamikochi","—"),
        it("~15:00","Kamikochi Bus Terminal","Per il collegamento verso Matsumoto il bus è Alpico/non-JR: il Japan Rail Pass non è valido. Prenotare la corsa richiesta e acquistare il titolo di viaggio previsto. ⚠️ Prenotazione + biglietto separato",{link:"https://www.google.com/maps/search/?api=1&query=Kamikochi+Bus+Terminal",transport:true}),
        it("pomeriggio","Kamikochi → Shin-Shimashima → Matsumoto","Bus Kamikochi → Shin-Shimashima + Alpico Railway Shin-Shimashima → Matsumoto. Sono servizi Alpico/non-JR: il Japan Rail Pass NON copre né il bus né il treno Alpico. Servono titoli di viaggio separati; il bus richiede prenotazione sui servizi previsti. ⚠️ NON coperto dal JR Pass",{link:"https://www.google.com/maps/search/?api=1&query=Shin-Shimashima+Station",transport:true}),
        it("~17:30–18:30","Matsumoto Hotel Kagetsu","Check-in. Hotel molto vicino al castello",{link:"https://www.google.com/maps/search/?api=1&query=Matsumoto+Hotel+Kagetsu"}),
        it("sera","Matsumoto / cena","Serata libera."),
      ]},
      {date:"21/09",wd:"lun",city:"Matsumoto → Tokyo",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Washington+Hotel+Main+Building&destination=Shinjuku+Washington+Hotel+Main+Building&waypoints=Tokyo+Metropolitan+Government+Building%7CKabukicho+Tokyo%7COmoide+Yokocho+Tokyo%7CShinjuku+Golden+Gai",label:"Itinerario completo 21/09",note:"Treno Matsumoto → Tokyo coperto dal JR Pass"}],items:[
        it("08:15","Hotel → Matsumoto Castle","Pochi minuti a piedi.",{transport:true}),
        it("08:30–09:45","Matsumoto Castle","08:30–17:00; ultimo ingresso circa 16:30. ⭐ Must-have",{link:"https://www.google.com/maps/search/?api=1&query=Matsumoto+Castle",top:true}),
        it("09:50–10:30","Nawate Street","Strada pedonale.",{link:"https://www.google.com/maps/search/?api=1&query=Nawate+Street+Matsumoto"}),
        it("10:30–11:00","Nakamachi Street","Quartiere storico.",{link:"https://www.google.com/maps/search/?api=1&query=Nakamachi+Street+Matsumoto"}),
        it("11:00–11:40","Hotel → bagagli → Matsumoto Station","Taxi o passeggiata.",{link:"https://www.google.com/maps/search/?api=1&query=Matsumoto+Station",transport:true}),
        it("~12:10–14:42","Matsumoto → Shinjuku","Limited Express Azusa Matsumoto → Shinjuku. Interamente coperto dal Japan Rail Pass Ordinary: non serve acquistare un biglietto separato. È consigliato prenotare il posto usando il pass; il posto ordinario coperto non richiede supplemento. Orario di riferimento ~12:10–14:42. Interamente coperto dal JR Pass",{link:"https://www.google.com/maps/search/?api=1&query=Shinjuku+Station",transport:true}),
        it("~15:00–15:30","Shinjuku Washington Hotel – Main Building","Check-in. Base per 4 notti. Posizione eccellente",{link:"https://www.google.com/maps/search/?api=1&query=Shinjuku+Washington+Hotel+Main+Building"}),
        it("16:00–17:00","Tokyo Metropolitan Government Building","A pochi minuti dall’hotel; osservatorio gratuito. Perfetto il primo giorno",{link:"https://www.google.com/maps/search/?api=1&query=Tokyo+Metropolitan+Government+Building"}),
        it("17:30–19:00","Kabukicho","Sempre accessibile; meglio la sera.",{link:"https://www.google.com/maps/search/?api=1&query=Kabukicho+Tokyo"}),
        it("19:00–20:00","Omoide Yokocho","Locali soprattutto serali. Cena possibile",{link:"https://www.google.com/maps/search/?api=1&query=Omoide+Yokocho+Tokyo"}),
        it("20:00 →","Golden Gai","Locali serali/notturni.",{link:"https://www.google.com/maps/search/?api=1&query=Shinjuku+Golden+Gai"}),
      ]},
      {date:"22/09",wd:"mar",city:"Tokyo",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Washington+Hotel+Main+Building&destination=Shinjuku+Washington+Hotel+Main+Building&waypoints=Senso-ji+Tokyo%7CUeno+Park+Tokyo%7CTokyo+National+Museum%7CAmeyoko+Tokyo%7CAkihabara+Electric+Town%7CTokyo+Skytree",label:"Itinerario completo 22/09",note:"🟡 Copertura mista: JR sì, metro/Toei/Tobu no"}],items:[
        it("~07:15","Hotel → Asakusa","Trasferimento Shinjuku → Asakusa. Il JR Pass copre solo eventuali segmenti effettuati su linee JR; Tokyo Metro/Toei non sono coperti e richiedono pagamento separato. Scegliere il percorso più pratico anche se include metro. 🟡 JR Pass solo sui tratti JR",{transport:true}),
        it("08:00–09:30","Senso-ji / Kaminarimon / Nakamise","Tempio visitabile presto; negozi Nakamise aprono progressivamente. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Senso-ji+Tokyo",top:true}),
        it("10:30–11:15","Ueno Park","Parco liberamente accessibile.",{link:"https://www.google.com/maps/search/?api=1&query=Ueno+Park+Tokyo"}),
        it("11:15–12:45","Tokyo National Museum – opzionale","Massimo 1–1,5h. 🟡 Uno solo dei musei basta",{link:"https://www.google.com/maps/search/?api=1&query=Tokyo+National+Museum"}),
        it("13:00–14:00","Ameyoko","Pranzo/assaggi/shopping.",{link:"https://www.google.com/maps/search/?api=1&query=Ameyoko+Tokyo"}),
        it("14:30–17:30","Akihabara Electric Town","Pomeriggio è la fascia migliore. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Akihabara+Electric+Town",top:true}),
        it("19:00–21:00","Tokyo Skytree","Salita opzionale; comunque da vedere illuminata. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Tokyo+Skytree",top:true}),
        it("~22:00","Rientro Shinjuku","Rientro verso Shinjuku. Il JR Pass vale sulle linee JR eventualmente utilizzate; Tokyo Metro, Toei e Tobu non sono coperti. 🟡 Copertura JR solo se si usano linee JR",{transport:true}),
      ]},
      {date:"23/09",wd:"mer",city:"Tokyo · Fuji",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Shimoyoshida+Station&destination=Kawaguchiko+Station&waypoints=Chureito+Pagoda%7CMt+Fuji+Panoramic+Ropeway+Kawaguchiko%7COishi+Park+Kawaguchiko",label:"Itinerario completo 23/09",note:"🟡 Copertura JR solo Shinjuku → Ōtsuki"}],items:[
        it("06:30","Colazione Shinjuku Washington Hotel","L’hotel permette di fare colazione prima del Fuji Excursion."),
        it("~07:00","Hotel → Shinjuku Station","Trasferimento dall’hotel a Shinjuku Station, normalmente a piedi. Nessun biglietto necessario. A piedi",{link:"https://www.google.com/maps/search/?api=1&query=Shinjuku+Station",transport:true}),
        it("07:30–09:13","Fuji Excursion n.3 → Shimoyoshida","Fuji Excursion n.3 diretto Shinjuku → Shimoyoshida. Il tratto JR Shinjuku → Ōtsuki è coperto dal Japan Rail Pass: non acquistare un biglietto JR separato. Da Ōtsuki a Shimoyoshida si viaggia sulla Fujikyu Railway, non coperta dal JR Pass: tariffa ordinaria ¥980 p.p. + supplemento Fuji Excursion ¥600 p.p., quindi circa ¥1.580 p.p. per la parte non coperta. Prenotare il posto e specificare che si utilizza il JR Pass. 🟡 JR Pass fino a Ōtsuki; ¥1.580 p.p. circa da pagare sulla parte Fujikyu",{link:"https://www.google.com/maps/search/?api=1&query=Shimoyoshida+Station",transport:true}),
        it("09:15–09:35","Shimoyoshida → Arakurayama Sengen Park","Circa 20 min a piedi.",{link:"https://www.google.com/maps/search/?api=1&query=Arakurayama+Sengen+Park",transport:true}),
        it("09:35–10:45","Chureito Pagoda","Gratuita; numerosi gradini. ⭐⭐⭐⭐⭐",{link:"https://www.google.com/maps/search/?api=1&query=Chureito+Pagoda",top:true}),
        it("~11:15","Shimoyoshida → Kawaguchiko","Treno locale Fujikyu Railway. Non è una linea JR, quindi il Japan Rail Pass non è valido. Tariffa indicativa ~¥310 p.p. da pagare separatamente. ⚠️ NON coperto dal JR Pass",{link:"https://www.google.com/maps/search/?api=1&query=Kawaguchiko+Station",transport:true}),
        it("~11:30","Kawaguchiko Station / Sightseeing Bus Pass","Sightseeing Bus Red Line / pass turistico. Servizio non-JR: il Japan Rail Pass non è valido. Pass indicativo ~¥1.500 p.p. ⚠️ NON coperto dal JR Pass",{link:"https://www.google.com/maps/search/?api=1&query=Kawaguchiko+Station",transport:true}),
        it("12:00–13:00","Mt. Fuji Panoramic Ropeway","~08:30–17:00; A/R circa ¥1.000 p.p. (~€5,40). ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Mt+Fuji+Panoramic+Ropeway+Kawaguchiko",top:true,transport:true}),
        it("13:00–13:45","Pranzo Lago Kawaguchi","Meglio rapido."),
        it("14:15–15:30","Oishi Park","Gratuito; splendida vista Fuji + lago. ⭐⭐⭐⭐",{link:"https://www.google.com/maps/search/?api=1&query=Oishi+Park+Kawaguchiko",top:true}),
        it("15:30–16:00","Lago Kawaguchi","Passeggiata panoramica.",{link:"https://www.google.com/maps/search/?api=1&query=Lake+Kawaguchi+Japan"}),
        it("~16:00–16:30","Red Line → Kawaguchiko Station","Rientro con Sightseeing Bus Red Line. Non coperto dal Japan Rail Pass; utilizzare il pass/biglietto turistico acquistato a Kawaguchiko. ⚠️ NON coperto dal JR Pass",{transport:true}),
        it("~17:00–17:30","Highway Bus Kawaguchiko → Shinjuku","Highway bus Kawaguchiko → Shinjuku. Non è coperto dal Japan Rail Pass. Prezzo indicativo ~¥2.000 p.p. online; prenotazione consigliata. ⚠️ NON coperto dal JR Pass",{transport:true}),
        it("~19:00–19:30","Shinjuku / hotel","Cena libera.",{link:"https://www.google.com/maps/search/?api=1&query=Shinjuku+Washington+Hotel+Main+Building"}),
      ]},
      {date:"24/09",wd:"gio",city:"Tokyo",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Washington+Hotel+Main+Building&destination=Shinjuku+Washington+Hotel+Main+Building&waypoints=Meiji+Jingu+Tokyo%7CTakeshita+Street+Harajuku%7COmotesando+Tokyo%7CHachiko+Statue+Shibuya%7CShibuya+Sky%7CZojo-ji+Tokyo%7CTokyo+Tower",label:"Itinerario completo 24/09",note:"🟡 Copertura mista: JR sì, metro/Toei no"}],items:[
        it("08:00–09:15","Meiji Jingu","Apre all’alba e chiude verso il tramonto. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Meiji+Jingu+Tokyo",top:true}),
        it("09:30–10:45","Harajuku / Takeshita Street","Negozi soprattutto dalle 10–11.",{link:"https://www.google.com/maps/search/?api=1&query=Takeshita+Street+Harajuku"}),
        it("11:00–12:30","Omotesando","Passeggiata, architettura e shopping.",{link:"https://www.google.com/maps/search/?api=1&query=Omotesando+Tokyo"}),
        it("12:30–13:30","Pranzo","—"),
        it("13:30–16:30","Shibuya / Hachiko / Crossing / Center-gai","Sempre accessibile. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Hachiko+Statue+Shibuya+Tokyo",top:true}),
        it("17:00–18:30","Shibuya Sky – opzionale","Panoramica. Prenotazione fortemente consigliata se scelto. 🟡 Salita opzionale",{link:"https://www.google.com/maps/search/?api=1&query=Shibuya+Sky+Tokyo"}),
        it("~20:00","Zojo-ji","Area esterna con Tokyo Tower sullo sfondo. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Zojo-ji+Tokyo",top:true}),
        it("20:15–21:30","Tokyo Tower","Main Deck normalmente fino alle 23:00. Salita opzionale. ⭐ Vederla sicuramente, salita a scelta",{link:"https://www.google.com/maps/search/?api=1&query=Tokyo+Tower",top:true}),
        it("~22:00","Shinjuku Washington Hotel","Ultima notte a Tokyo."),
      ]},
      {date:"25/09",wd:"ven",city:"Tokyo → volo",routes:[{url:"https://www.google.com/maps/dir/?api=1&origin=Shinjuku+Washington+Hotel+Main+Building&destination=Shinjuku+Washington+Hotel+Main+Building&waypoints=teamLab+Planets+TOKYO+Toyosu%7CHama-rikyu+Gardens+Tokyo%7CGinza+Tokyo%7CTokyo+Station",label:"Itinerario completo 25/09",note:"Giornata volutamente prudente"}],items:[
        it("~07:00–07:15","Check-out / bagagli in hotel","Lasciare le valigie in deposito allo Shinjuku Washington.",{link:"https://www.google.com/maps/search/?api=1&query=Shinjuku+Washington+Hotel+Main+Building"}),
        it("08:00–09:30","teamLab Planets – Toyosu","Prenotare il primo slot disponibile. ⭐ Priorità della mattina",{link:"https://www.google.com/maps/search/?api=1&query=teamLab+Planets+TOKYO+Toyosu",top:true}),
        it("10:15–11:30","Hama-rikyu Gardens","09:00–17:00, ultimo ingresso 16:30. ⭐",{link:"https://www.google.com/maps/search/?api=1&query=Hama-rikyu+Gardens+Tokyo",top:true}),
        it("11:45–13:00","Ginza + pranzo","Passeggiata finale / shopping.",{link:"https://www.google.com/maps/search/?api=1&query=Ginza+Tokyo"}),
        it("13:00–13:40","Marunouchi / Tokyo Station – opzionale","Solo se sono perfettamente nei tempi. 🟡 Sacrificabile",{link:"https://www.google.com/maps/search/?api=1&query=Tokyo+Station+Marunouchi",transport:true}),
        it("~14:00","Rientro Shinjuku Washington Hotel","Recupero bagagli.",{transport:true}),
        it("prima della partenza","Restituzione Wi-Fi router","Noleggio 11 giorni. Seguire la procedura indicata dal tour operator; ritardo ¥2.000/giorno. ⚠️ DA NON DIMENTICARE"),
        it("~14:30–15:00","Shinjuku → Narita Airport","Preferire Airport Limousine Bus dalla zona dello Shinjuku Washington con valigie. Considerare 2–2h30 circa a seconda del traffico. Molto prudente",{link:"https://www.google.com/maps/search/?api=1&query=Narita+International+Airport",transport:true}),
        it("~17:00–17:30","Narita Airport","Check-in Air Tahiti Nui, controlli e imbarco. 2h30–3h di margine",{link:"https://www.google.com/maps/search/?api=1&query=Narita+International+Airport"}),
        it("20:00","Tokyo Narita → Papeete","Volo TN0087 Air Tahiti Nui, arrivo previsto 11:45 locale. Bagaglio in stiva incluso. Fine parte Giappone",{transport:true}),
      ]},
    ];
  }


  function uid(){return 'i'+Math.random().toString(36).slice(2,10);}
  function escapeHtml(s){
    return String(s||"").replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function mapsLink(title,city){
    var q = title + ", " + city + ", Giappone";
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  }


  var JR_PASS = {
    validFrom:"18/09", validTo:"24/09", type:"Japan Rail Pass Ordinary 7 giorni",
    covered:[
      "18/09 Kyoto → Tsuruga → Kanazawa (Thunderbird + Hokuriku Shinkansen)",
      "21/09 Matsumoto → Shinjuku (Limited Express Azusa)",
      "23/09 Fuji Excursion: solo Shinjuku → Ōtsuki"
    ],
    notCovered:[
      "19/09 bus Kanazawa → Shirakawago → Takayama (già inclusi nel voucher)",
      "20/09 Nohi Bus Takayama → Hirayu → Kamikochi",
      "20/09 Alpico Kamikochi → Shin-Shimashima → Matsumoto",
      "23/09 Fujikyu Railway Ōtsuki → Shimoyoshida e Shimoyoshida → Kawaguchiko",
      "23/09 Kawaguchiko sightseeing bus e highway bus",
      "Tokyo Metro / Toei / Tobu durante i giorni a Tokyo"
    ]
  };

  // Consigli sul cibo preparati in anticipo; se ne aggiungono altri dall'app.
  function defaultFood(){
    return [
      {id:uid(),title:"Gyoza Hohei Gion Honten",website:"https://gyozahohei.com/",zone:"Kyoto · 14/09 sera",note:"Gyoza. Siete già a Gion; ottimo anche come snack/cena leggera. Prenotazione: No. Pagamento: Carte + IC. Spesa media a persona: ~¥1.000–2.000.",link:"https://www.google.com/maps/search/?api=1&query=Gyoza+Hohei+Gion+Kyoto"},
      {id:uid(),title:"Men-ya Inoichi",website:"https://menyainoichi.net/",zone:"Kyoto · 15/09 pranzo",note:"Ramen. Prenotazione: No; numeri distribuiti dalle 10:30. Pagamento: Carte / IC / alcuni QR. Spesa media a persona: ~¥1.000–2.000.",link:"https://www.google.com/maps/search/?api=1&query=Menya+Inoichi+Kyoto"},
      {id:uid(),title:"Yamamoto Menzou",website:"https://yamamotomenzou.com/",zone:"Kyoto · 15/09 pranzo",note:"Udon. Alternativa. Prenotazione: Sì, Fast Pass online. Pagamento: Contanti. Spesa media a persona: ~¥1.000–2.000.",link:"https://www.google.com/maps/search/?api=1&query=Yamamoto+Menzo+Kyoto"},
      {id:uid(),title:"Spice Chamber",website:"https://spicechamber.com/",zone:"Kyoto · 15/09 pranzo",note:"Riso al curry. Alternativa, comodo zona Shijo/Karasuma. Prenotazione: No. Pagamento: Contanti. Spesa media a persona: ~¥1.000–2.000.",link:"https://www.google.com/maps/search/?api=1&query=Spice+Chamber+Kyoto"},
      {id:uid(),title:"New Wave Kyoto",website:"https://tabelog.com/en/kyoto/A2601/A260101/26044419/",zone:"Kyoto · 15/09 pranzo",note:"Tonkatsu. Alternativa. Prenotazione: Sì. Pagamento: Carte. Spesa media a persona: ~¥2.000–4.000.",link:"https://www.google.com/maps/search/?api=1&query=New+Wave+Kyoto+Tonkatsu"},
      {id:uid(),title:"Onigiri Hatsuki",website:"https://www.instagram.com/hatsuki_kyoto/",zone:"Kyoto · 15/09",note:"Onigiri. Snack/pranzo leggero, zona Karasuma-Nishiki. Prenotazione: Sì. Pagamento: Carte + e-money + QR. Spesa media a persona: < ¥1.000.",link:"https://www.google.com/maps/search/?api=1&query=Onigiri+Hatsuki+Kyoto"},
      {id:uid(),title:"Stand by Me",website:"https://yakisoba-standbyme.com/",zone:"Kyoto · 15/09 pranzo",note:"Yakisoba. Alternativa, zona Nijō/Karasuma. Prenotazione: No. Pagamento: Contanti consigliati. Spesa media a persona: ~¥600–1.600.",link:"https://www.google.com/maps/search/?api=1&query=Yakisoba+Stand+By+Me+Kyoto"},
      {id:uid(),title:"Kyoto Gion Tempura Yasaka Endo",website:"https://www.gion-endo.com/en/",zone:"Kyoto · 15/09 pranzo",note:"Tempura. Premium, alternativa. Prenotazione: Sì. Pagamento: Carte + IC + QR. Spesa media a persona: ~¥8.000–14.000 (pranzo).",link:"https://www.google.com/maps/search/?api=1&query=Kyoto+Gion+Tempura+Yasaka+Endo"},
      {id:uid(),title:"Kobe Beef Steak Mouriya Gion",website:"https://www.mouriya.co.jp/en/gion",zone:"Kyoto · 15/09 cena",note:"Wagyu / Kobe beef. Scelta principale mentre siete a Gion. Prenotazione: Sì. Pagamento: Carte principali. Spesa media a persona: ~¥15.000–25.000+.",link:"https://www.google.com/maps/search/?api=1&query=Kobe+Beef+Steak+Mouriya+Gion+Kyoto"},
      {id:uid(),title:"Kamehameha",website:"http://www.kamehameha.website/",zone:"Kyoto · 15/09 cena",note:"Okonomiyaki. Alternativa. Prenotazione: Sì. Pagamento: Carte + PayPay + contanti. Spesa media a persona: ¥2.000–4.000.",link:"https://www.google.com/maps/search/?api=1&query=Kamehameha+Okonomiyaki+Kyoto"},
      {id:uid(),title:"Yakiniku Yazawa Kyoto",website:"https://valuet.co.jp/brands/en/yazawa-kyoto/",zone:"Kyoto · 15/09 cena",note:"Yakiniku / BBQ. Alternativa. Prenotazione: Sì, TableCheck. Pagamento: Carte (carta come garanzia). Spesa media a persona: ¥10.000–15.000.",link:"https://www.google.com/maps/search/?api=1&query=Yakiniku+Yazawa+Kyoto"},
      {id:uid(),title:"Sushi Matsumoto",website:"https://tabelog.com/en/kyoto/A2601/A260301/26002579/",zone:"Kyoto · 15/09 cena",note:"Sushi. Alternativa premium, Gion. Prenotazione: Sì. Pagamento: Carte principali. Spesa media a persona: ~¥20.000–30.000 (cena).",link:"https://www.google.com/maps/search/?api=1&query=Sushi+Matsumoto+Gion+Kyoto"},
      {id:uid(),title:"Kyoto Gion Tempura Yasaka Endo",website:"https://www.gion-endo.com/en/",zone:"Kyoto · 15/09 cena",note:"Tempura. Alternativa premium. Prenotazione: Sì. Pagamento: Carte + IC + QR. Spesa media a persona: ~¥20.000–30.000.",link:"https://www.google.com/maps/search/?api=1&query=Kyoto+Gion+Tempura+Yasaka+Endo"},
      {id:uid(),title:"Mishima-tei Honten",website:"https://www.mishima-tei.co.jp/",zone:"Kyoto · 15/09 cena",note:"Sukiyaki. Alternativa premium, tra Nishiki e Pontocho. Prenotazione: Sì. Pagamento: Carte + IC + QR. Spesa media a persona: ~¥15.000–20.000+.",link:"https://www.google.com/maps/search/?api=1&query=Mishima-tei+Kyoto"},
      {id:uid(),title:"Takoyaki Kurobei",website:"https://tabelog.com/kyoto/A2601/A260301/26021860/",zone:"Kyoto · 15/09 sera",note:"Takoyaki. Snack, tra Gion e Pontocho. Prenotazione: No. Pagamento: Contanti consigliati. Spesa media a persona: ~¥1.000–2.000.",link:"https://www.google.com/maps/search/?api=1&query=Takoyaki+Kurobei+Kyoto"},
      {id:uid(),title:"Takoyaki Doraku Wanaka Dotonbori",website:"https://takoyaki-wanaka.com/en/",zone:"Osaka · 16/09, 18:45–20:00",note:"Takoyaki. Durante la visita a Dotonbori. Prenotazione: No, non serve. Pagamento: Carte + e-money + QR. Spesa media a persona: < ¥1.000.",link:"https://www.google.com/maps/search/?api=1&query=Takoyaki+Doraku+Wanaka+Dotonbori+Osaka"},
      {id:uid(),title:"Kobe Beef WAGYU KATANA Nishi-Shinjuku 1",website:"https://wagyukatana.com/en/store/",zone:"Tokyo · 21/09 cena",note:"Wagyu / Kobe beef. Scelta principale, vicinissimo all'hotel. Prenotazione: Sì. Pagamento: Carte. Spesa media a persona: ~¥10.000–20.000+.",link:"https://www.google.com/maps/search/?api=1&query=Kobe+Beef+WAGYU+KATANA+Nishi-Shinjuku+1+Tokyo"},
      {id:uid(),title:"Katsu Pulipo",website:"https://tabelog.com/en/tokyo/A1304/A130401/13264309/",zone:"Tokyo · 21/09 cena",note:"Tonkatsu. Alternativa, Shinjuku. Prenotazione: Sì. Pagamento: Carte. Spesa media a persona: ~¥4.000–10.000.",link:"https://www.google.com/maps/search/?api=1&query=Katsu+Pulipo+Shinjuku+Tokyo"},
      {id:uid(),title:"Onigiri Asakusa Yadoroku",website:"https://onigiriyadoroku.com/",zone:"Tokyo · 22/09 ~11:30",note:"Onigiri. Subito dopo Senso-ji. Prenotazione: No; può chiudere a esaurimento. Pagamento: Contanti consigliati. Spesa media a persona: ~¥1.000–2.000.",link:"https://www.google.com/maps/search/?api=1&query=Onigiri+Asakusa+Yadoroku+Tokyo"},
      {id:uid(),title:"Curry Bondy",website:"https://bondy.co.jp/web/contents/home.html",zone:"Tokyo · 22/09 pranzo",note:"Riso al curry. Alternativa, deviazione a Jimbocho. Prenotazione: No. Pagamento: Contanti consigliati. Spesa media a persona: ~¥1.500–2.500.",link:"https://www.google.com/maps/search/?api=1&query=Bondy+Curry+Jimbocho+Tokyo"},
      {id:uid(),title:"Yakisoba Mikasa",website:"https://tabelog.com/en/tokyo/A1310/A131003/13163715/",zone:"Tokyo · 22/09 pranzo",note:"Yakisoba. Alternativa, Jimbocho. Prenotazione: ⚠️ Meglio considerarlo da coda. Pagamento: Contanti. Spesa media a persona: ~¥1.000–1.500.",link:"https://www.google.com/maps/search/?api=1&query=Yakisoba+Mikasa+Jimbocho+Tokyo"},
      {id:uid(),title:"Kameido Gyoza Honten",website:"https://kameido-gyouza.co.jp/",zone:"Tokyo · 22/09 ~17:30",note:"Gyoza. Tra Akihabara e Skytree. Prenotazione: No. Pagamento: No carte; alcuni QR. Spesa media a persona: ~¥1.000–2.000.",link:"https://www.google.com/maps/search/?api=1&query=Kameido+Gyoza+Honten+Tokyo"},
      {id:uid(),title:"Ningyocho Imahan Honten",website:"https://imahan-tokyo.com/official/",zone:"Tokyo · 22/09 cena",note:"Sukiyaki. Alternativa premium, prima di Skytree. Prenotazione: Sì. Pagamento: Carte + IC + QR. Spesa media a persona: ~¥10.000–20.000+.",link:"https://www.google.com/maps/search/?api=1&query=Ningyocho+Imahan+Honten+Tokyo"},
      {id:uid(),title:"Udon Shin",website:"https://shin.daybreak.jp/",zone:"Tokyo · 23/09 cena",note:"Udon. Comodo dopo il rientro dal Fuji a Shinjuku. Prenotazione: Sì, Fast Pass. Pagamento: Contanti. Spesa media a persona: ~¥1.000–2.000.",link:"https://www.google.com/maps/search/?api=1&query=Udon+Shin+Tokyo"},
      {id:uid(),title:"Japanese Soba Noodles Tsuta",website:"https://www.tsuta79.tokyo/",zone:"Tokyo · 24/09 pranzo",note:"Ramen. Proposta principale. Prenotazione: Sì, TableCheck (carta per garanzia). Pagamento: Solo cashless. Spesa media a persona: ~¥2.000–3.500.",link:"https://www.google.com/maps/search/?api=1&query=Japanese+Soba+Noodles+Tsuta+Tokyo"},
      {id:uid(),title:"Okonomiyaki Imari Shibuya",website:"https://tabelog.com/en/tokyo/A1303/A130301/13224029/",zone:"Tokyo · 24/09 cena",note:"Okonomiyaki. Alternativa, Shibuya. Prenotazione: Sì. Pagamento: Carte. Spesa media a persona: ¥4.000–6.000.",link:"https://www.google.com/maps/search/?api=1&query=Okonomiyaki+Imari+Shibuya"},
      {id:uid(),title:"Yoroniku",website:"https://yoroniku-ebisu.com/",zone:"Tokyo · 24/09 cena",note:"Yakiniku / BBQ. Alternativa premium, Omotesando/Minami-Aoyama. Prenotazione: Sì; carta richiesta. Pagamento: Carta. Spesa media a persona: ~¥10.500–15.000+.",link:"https://www.google.com/maps/search/?api=1&query=Yoroniku+Minami+Aoyama+Tokyo"},
      {id:uid(),title:"TAKOBIVA",website:"https://www.instagram.com/takobiva.shimbashi/",zone:"Tokyo · 24/09",note:"Takoyaki. Dopo Tokyo Tower, snack serale, Shinbashi. Prenotazione: ⚠️ Non necessaria per il nostro utilizzo. Pagamento: Carte + e-money + QR. Spesa media a persona: ~¥1.000 (snack).",link:"https://www.google.com/maps/search/?api=1&query=TAKOBIVA+Shinbashi+Tokyo"},
      {id:uid(),title:"Tempura Kondo",website:"https://tempura-kondo.com/en/",zone:"Tokyo · 25/09 ~11:30",note:"Tempura. Molto coerente con Ginza. Prenotazione: Sì; consigliata. Pagamento: Carte. Spesa media a persona: ~¥13.200–22.000 (pranzo).",link:"https://www.google.com/maps/search/?api=1&query=Tempura+Kondo+Ginza+Tokyo"},
      {id:uid(),title:"Sushizanmai Main Store – Tsukiji",website:"https://www.kiyomura.co.jp/",zone:"Tokyo · 25/09 pranzo",note:"Sushi. Alternativa, dopo Hama-rikyu e prima di Ginza. Prenotazione: Honten non prenotabile; Tsukiji Ekimae sì. Pagamento: Carte + IC + QR. Spesa media a persona: ~¥2.000–6.000.",link:"https://www.google.com/maps/search/?api=1&query=Sushizanmai+Main+Store+Tsukiji"},
    ];
  }

  // Contenuti verificati (numeri reali di ambasciata/consolato, non inventati).
  var USEFUL_INFO = {
    emergency: [
      {label:"Polizia", value:"110"},
      {label:"Ambulanza / Vigili del fuoco", value:"119"},
      {label:"Ambasciata d'Italia a Tokyo", value:"+81 3-3453-5291", note:"2-5-4 Mita, Minato-ku, Tokyo. Fuori orario ufficio (solo emergenze): +81 90-3908-1006"},
      {label:"Consolato Generale d'Italia a Osaka", value:"+81 6-4706-5820", note:"Nakanoshima, Kita-ku, Osaka (competente per Kyoto/Nara/Osaka). Emergenze: +81 90-3350-1561"},
      {label:"Unità di Crisi Farnesina (dall'Italia)", value:"+39 06 36225"}
    ],
    phraseGroups: [
      {category:"Base", items:[
        {jp:"Konnichiwa", it:"Buongiorno"},
        {jp:"Konbanwa", it:"Buonasera"},
        {jp:"Arigatou gozaimasu", it:"Grazie"},
        {jp:"Doumo arigatou gozaimasu", it:"Grazie mille"},
        {jp:"Dou itashimashite", it:"Prego / di niente"},
        {jp:"Sumimasen", it:"Mi scusi"},
        {jp:"Onegaishimasu", it:"Per favore"},
        {jp:"Hai", it:"Sì"},
        {jp:"Iie", it:"No"},
        {jp:"Wakarimasen", it:"Non capisco"},
        {jp:"Eigo o hanasemasu ka?", it:"Parla inglese?"},
        {jp:"Mou sukoshi yukkuri hanashite kudasai", it:"Può parlare più lentamente?"},
        {jp:"Mou ichido onegaishimasu", it:"Può ripetere?"},
      ]},
      {category:"Orientamento", items:[
        {jp:"... wa doko desu ka?", it:"Dov'è...?"},
        {jp:"Eki wa doko desu ka?", it:"Dov'è la stazione?"},
        {jp:"Toire wa doko desu ka?", it:"Dov'è il bagno?"},
        {jp:"Tooi desu ka?", it:"È lontano?"},
        {jp:"Aruite ikemasu ka?", it:"Posso andare a piedi?"},
        {jp:"Koko ni ikitai desu", it:"Vorrei andare qui"},
        {jp:"Kono juusho made onegaishimasu", it:"A questo indirizzo, per favore"},
      ]},
      {category:"Trasporti", items:[
        {jp:"Kono densha wa ... ni ikimasu ka?", it:"Questo treno va a...?"},
        {jp:"Nan-bansen desu ka?", it:"Quale binario?"},
        {jp:"Norikae ga hitsuyou desu ka?", it:"Devo cambiare treno?"},
        {jp:"... made ichimai onegaishimasu", it:"Un biglietto per..., per favore"},
        {jp:"Kono seki wa shiteiseki desu ka?", it:"Questo posto è riservato?"},
      ]},
      {category:"Ristorante", items:[
        {jp:"Futari desu", it:"Un tavolo per due, per favore"},
        {jp:"Seki wa aiteimasu ka?", it:"Avete un tavolo libero?"},
        {jp:"Menyuu o onegaishimasu", it:"Il menu, per favore"},
        {jp:"Eigo no menyuu wa arimasu ka?", it:"Avete un menu in inglese?"},
        {jp:"Kore o onegaishimasu", it:"Questo, per favore"},
        {jp:"Osusume wa nan desu ka?", it:"Cosa consiglia?"},
        {jp:"Karaku shinaide kudasai", it:"Senza piccante, per favore"},
        {jp:"Arerugii ga arimasu", it:"Ho un'allergia"},
        {jp:"Kore wa nan desu ka?", it:"Che cos'è questo?"},
        {jp:"Okaikei onegaishimasu", it:"Il conto, per favore"},
        {jp:"Kaado de haraemasu ka?", it:"Posso pagare con carta?"},
      ]},
      {category:"Shopping", items:[
        {jp:"Ikura desu ka?", it:"Quanto costa?"},
        {jp:"Kaado wa tsukaemasu ka?", it:"Posso pagare con carta?"},
        {jp:"Motto ookii saizu wa arimasu ka?", it:"Avete una taglia più grande?"},
      ]},
      {category:"Utili", items:[
        {jp:"Shashin o totte mo ii desu ka?", it:"Posso fare una foto?"},
        {jp:"Waifai wa arimasu ka?", it:"Avete il Wi-Fi?"},
      ]},
      {category:"Emergenza", items:[
        {jp:"Tasukete kudasai!", it:"Aiuto!"},
        {jp:"Isha ga hitsuyou desu", it:"Ho bisogno di un medico"},
        {jp:"Kyuukyuusha o yonde kudasai", it:"Chiamate un'ambulanza"},
        {jp:"Pasupooto o nakushimashita", it:"Ho perso il passaporto"},
      ]},
    ],
    currencyRateJpyPerEur: 181
  };

  // Alloggi del viaggio, con indirizzo e telefono reali (utile se serve chiedere
  // aiuto a qualcuno del posto). Modificabili/aggiungibili dall'app.
  function defaultLodging(){
    return [
      {id:uid(),title:"Mitsui Garden Hotel Kyoto Shijo",address:"707-1 Myodenji-cho, Shijo-sagaru, Nishinotoin-dori, Shimogyo-ku, Kyoto 600-8472, Japan",phone:"+81 75-361-5531",note:"Kyoto · 14–16/09/2026 (3 notti)",link:"https://www.google.com/maps/search/?api=1&query=Mitsui+Garden+Hotel+Kyoto+Shijo"},
      {id:uid(),title:"Seikoro",address:"467 Nishitachibana-cho, Toiyamachi-dori Gojo-sagaru, Higashiyama-ku, Kyoto 605-0907, Japan",phone:"+81 75-561-0771",note:"Kyoto · 17/09/2026 (1 notte)",link:"https://www.google.com/maps/search/?api=1&query=Seikoro+Ryokan+Kyoto"},
      {id:uid(),title:"KOKO HOTEL Premier Kanazawa Korinbo",address:"1-2-16 Korinbo, Kanazawa, Ishikawa 920-0961, Japan",phone:"+81 76-223-8805",note:"Kanazawa · 18/09/2026 (1 notte)",link:"https://www.google.com/maps/search/?api=1&query=KOKO+HOTEL+Premier+Kanazawa+Korinbo"},
      {id:uid(),title:"TOKYU STAY Hida-Takayama Musubi no Yu",address:"4-301 Hanasatomachi, Takayama-shi, Gifu 506-0026, Japan",phone:"+81 577-36-1109",note:"Takayama · 19/09/2026 (1 notte)",link:"https://www.google.com/maps/search/?api=1&query=TOKYU+STAY+Hida-Takayama+Musubi+no+Yu"},
      {id:uid(),title:"Matsumoto Hotel Kagetsu",address:"4-8-9 Ote, Matsumoto, Nagano 390-0874, Japan",phone:"+81 263-32-0114",note:"Matsumoto · 20/09/2026 (1 notte)",link:"https://www.google.com/maps/search/?api=1&query=Matsumoto+Hotel+Kagetsu"},
      {id:uid(),title:"Shinjuku Washington Hotel – Main Building",address:"3-2-9 Nishi-Shinjuku, Shinjuku-ku, Tokyo 160-8336, Japan",phone:"+81 3-3343-3111",note:"Tokyo · 21–24/09/2026 (4 notti)",link:"https://www.google.com/maps/search/?api=1&query=Shinjuku+Washington+Hotel+Main+Building"},
    ];
  }
