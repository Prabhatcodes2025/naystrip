const commonInclusions = [
  "Accommodation on twin sharing basis for all mentioned nights as per itinerary",
  "Breakfast at all hotels as per itinerary",
  "All pickup, drop and sightseeing as per itinerary",
  "Toll tax, parking and driver allowances",
  "Child below 5 years sharing the same bed with a parent",
];

const commonExclusions = [
  "Entry fees, green tax, travel insurance and monument entry charges",
  "Personal expenses, optional tours, detours and extra meals",
  "Early check-in or late check-out at hotels",
  "Adventure activities unless explicitly included",
  "Airfare and train fare",
  "GST and vehicle entry tax, as applicable",
  "Anything not mentioned in inclusions",
];

export const cancellationSlabs = [
  { from: 91, to: 120, fee: 10 }, { from: 61, to: 90, fee: 15 },
  { from: 46, to: 60, fee: 25 }, { from: 31, to: 45, fee: 40 },
  { from: 16, to: 30, fee: 50 }, { from: 6, to: 15, fee: 75 },
  { from: 0, to: 5, fee: 100 },
];

const img = {
  mumbai: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1600&q=82",
  caves: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1600&q=82",
  temple: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=82",
  hills: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=82",
  coast: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=82",
  fort: "https://images.unsplash.com/photo-1585136917228-9e5c7e8d0d3f?auto=format&fit=crop&w=1600&q=82",
};

const makeTour = ({ slug, title, duration, destinations, image, itinerary, notes = [] }) => {
  const [nights, days] = duration.split("N/").map((v) => Number(v.replace("D", "")));
  return {
    slug, title, destination: destinations[0], destinations, type: "Domestic",
    tripType: destinations.some((d) => /Shirdi|Nashik|Ashtavinayak/i.test(d)) ? "Pilgrimage" : "Maharashtra",
    duration: `${days} Days / ${nights} Nights`, nights, days, image, itinerary,
    inclusions: commonInclusions, exclusions: commonExclusions, notes,
    price: null, priceLabel: "Price on request", source: "Supplied Maharashtra package itinerary",
    overview: `${days}-day Maharashtra circuit covering ${destinations.join(", ")}. The route and day sequence are preserved from the supplied NaysTrip itinerary.`,
  };
};

export const tours = [
  makeTour({slug:"mumbai-city-tour-3-days",title:"Mumbai City Tour",duration:"2N/3D",destinations:["Mumbai"],image:img.mumbai,itinerary:[
    {day:1,title:"Arrival and South Mumbai",details:"Pickup from Mumbai airport or railway station, hotel check-in, then Elephanta Caves, Gateway of India, Taj Mahal Palace Hotel photo stop, CST photography, CSMVS Museum, Marine Drive and Girgaon Chowpatty. Overnight in Mumbai."},
    {day:2,title:"Mumbai Sightseeing",details:"After breakfast visit Siddhivinayak Temple, Mahalaxmi Temple, Haji Ali Dargah causeway, celebrity homes drive, Bandra Fort, Bandra-Worli Sea Link, Bandstand and Juhu Beach. Overnight in Mumbai."},
    {day:3,title:"Shopping and Departure",details:"After breakfast check out. Shopping options include Phoenix Palladium, Linking Road, Hill Road and Crawford Market, followed by airport drop."}
  ]}),
  makeTour({slug:"aurangabad-ajanta-ellora-3-days",title:"Chhatrapati Sambhajinagar, Ajanta & Ellora",duration:"2N/3D",destinations:["Chhatrapati Sambhajinagar","Ajanta","Ellora"],image:img.caves,notes:["Chhatrapati Sambhajinagar to Ajanta is approximately a 3-4 hour drive."],itinerary:[
    {day:1,title:"Arrival and Ajanta Caves",details:"Morning arrival and railway station pickup. Check in, freshen up, then visit the UNESCO-listed Ajanta Caves. Evening at leisure or in the local market. Overnight in Chhatrapati Sambhajinagar."},
    {day:2,title:"Ellora and Ghrishneshwar",details:"After breakfast visit Ghrishneshwar Jyotirlinga, the UNESCO-listed Ellora Caves, Sleeping Hanumanji and the silk market. Overnight in Chhatrapati Sambhajinagar."},
    {day:3,title:"City Sights and Departure",details:"After breakfast visit Bibi Ka Maqbara, Aurangabad Caves and Panchakki. Evening railway station drop."}
  ]}),
  makeTour({slug:"pune-nashik-shirdi-sambhajinagar-5-days",title:"Pune, Nashik, Shirdi & Chhatrapati Sambhajinagar",duration:"4N/5D",destinations:["Pune","Bhimashankar","Nashik","Shirdi","Chhatrapati Sambhajinagar"],image:img.temple,itinerary:[
    {day:1,title:"Pune to Bhimashankar and Nashik",details:"Arrival in Pune, airport or railway pickup, drive to Bhimashankar for temple darshan, then Nashik check-in and Godavari Ghat. Overnight in Nashik."},
    {day:2,title:"Trimbakeshwar and Nashik",details:"After breakfast visit Trimbakeshwar Jyotirlinga, Brahmagiri and the optional origin point of the Godavari River. Evening at Gangapur Dam. Overnight in Nashik."},
    {day:3,title:"Nashik to Shirdi",details:"Drive to Shirdi, Sai Baba Temple darshan, Dwarkamai and museum, followed by evening aarti. Overnight in Shirdi."},
    {day:4,title:"Shani Shingnapur to Chhatrapati Sambhajinagar",details:"After breakfast visit Shani Shingnapur, then continue after lunch to Chhatrapati Sambhajinagar and visit Bibi Ka Maqbara. Overnight in Chhatrapati Sambhajinagar."},
    {day:5,title:"Ellora to Pune",details:"After breakfast visit Ghrishneshwar Jyotirlinga and Ellora Caves, then start the return journey to Pune."}
  ]}),
  makeTour({slug:"pune-nashik-shirdi-aurangabad-4-days",title:"Pune, Nashik, Shirdi & Aurangabad",duration:"3N/4D",destinations:["Pune","Bhimashankar","Nashik","Shirdi","Aurangabad"],image:img.temple,notes:["Aurangabad to Pune is approximately a 6-hour drive."],itinerary:[
    {day:1,title:"Pune to Bhimashankar and Nashik",details:"Pune arrival and pickup, Bhimashankar temple darshan, then Nashik check-in and Godavari Ghat or Panchvati. Overnight in Nashik."},
    {day:2,title:"Trimbakeshwar to Shirdi",details:"After breakfast visit Trimbakeshwar Jyotirlinga. After lunch continue to Shirdi for evening temple darshan. Overnight in Shirdi."},
    {day:3,title:"Shani Shingnapur to Aurangabad",details:"After breakfast visit Shani Shingnapur, then Ghrishneshwar Jyotirlinga and Ellora Caves if time permits. Overnight in Aurangabad."},
    {day:4,title:"Aurangabad to Pune",details:"After breakfast visit Bibi Ka Maqbara and begin the return journey to Pune."}
  ]}),
  makeTour({slug:"mumbai-mahabaleshwar-3-days",title:"Mumbai to Mahabaleshwar",duration:"2N/3D",destinations:["Mumbai","Mahabaleshwar","Panchgani"],image:img.hills,notes:["Paragliding is optional and payable directly."],itinerary:[
    {day:1,title:"Mumbai to Mahabaleshwar",details:"Airport or railway pickup in Mumbai and drive to Mahabaleshwar. Hotel check-in, Mapro Garden, Venna Lake and the local market. Overnight in Mahabaleshwar."},
    {day:2,title:"Mahabaleshwar Sightseeing",details:"Arthur's Seat, Elephant's Head Point, Kate's Point, strawberry farm, Bombay Point and optional paragliding on direct payment. Overnight in Mahabaleshwar or Panchgani."},
    {day:3,title:"Panchgani and Mumbai Departure",details:"After breakfast visit Table Land and Sydney Point, then return towards Mumbai for an evening airport drop."}
  ]}),
  makeTour({slug:"mumbai-mahabaleshwar-5-days",title:"Mumbai & Mahabaleshwar Explorer",duration:"4N/5D",destinations:["Mumbai","Mahabaleshwar","Panchgani","Tapola"],image:img.hills,notes:["Paragliding and boating or kayaking at Tapola are payable directly unless quoted as included."],itinerary:[
    {day:1,title:"South Mumbai",details:"Pickup and hotel check-in, then Gateway of India, Taj Mahal Palace photo stop, CST photography, CSMVS Museum and Marine Drive. Overnight in Mumbai."},
    {day:2,title:"Mumbai to Mahabaleshwar",details:"After breakfast drive to Mahabaleshwar and visit Mapro Garden, Venna Lake and the local market. Overnight in Mahabaleshwar."},
    {day:3,title:"Mahabaleshwar Sightseeing",details:"Arthur's Seat, Elephant's Head Point, Kate's Point, strawberry farm and Bombay Point. Overnight in Mahabaleshwar."},
    {day:4,title:"Panchgani and Tapola",details:"Table Land, Sydney Point, optional paragliding, then Tapola for boating, kayaking and local food. Return to Mahabaleshwar for the night."},
    {day:5,title:"Return to Mumbai",details:"Proceed towards Mumbai with an en-route lunch stop and evening airport or railway station drop."}
  ]}),
  makeTour({slug:"pune-mahabaleshwar-mumbai-6-days",title:"Pune, Mahabaleshwar & Mumbai",duration:"5N/6D",destinations:["Pune","Mahabaleshwar","Panchgani","Mumbai"],image:img.hills,itinerary:[
    {day:1,title:"Pune Arrival and Sightseeing",details:"Pickup, hotel check-in, Shaniwar Wada, Dagdusheth Halwai Ganpati Temple and Sinhagad Fort. Overnight in Pune."},
    {day:2,title:"Pune to Mahabaleshwar",details:"Drive to Mahabaleshwar, visit Mapro Garden, Venna Lake and the local market. Overnight in Mahabaleshwar."},
    {day:3,title:"Mahabaleshwar Sightseeing",details:"Arthur's Seat, Elephant's Head Point, Kate's Point and Bombay Point."},
    {day:4,title:"Panchgani Sightseeing",details:"Table Land, strawberry farm, Sydney Point and optional paragliding. Overnight in Mahabaleshwar."},
    {day:5,title:"Mahabaleshwar to Mumbai",details:"Early start for Mumbai, hotel check-in, Gateway of India, Taj Mahal Palace photo stop, CST photography, CSMVS Museum and Marine Drive. Overnight in Mumbai."},
    {day:6,title:"Mumbai Sightseeing and Departure",details:"Siddhivinayak Temple, Mahalaxmi Temple, Haji Ali Dargah, Bandra-Worli Sea Link drive, Juhu Beach and Bandstand, followed by airport or railway drop."}
  ]}),
  makeTour({slug:"mumbai-konkan-5-days",title:"Mumbai & Konkan Coast",duration:"4N/5D",destinations:["Mumbai","Alibaug","Diveagar","Harihareshwar","Ganpatipule"],image:img.coast,notes:["Beach activities and the Ganpatipule zipline are on a direct-payment basis."],itinerary:[
    {day:1,title:"Mumbai Arrival",details:"Pickup, hotel check-in, Gateway of India, Taj Mahal Palace photo stop, CST, CSMVS Museum, Siddhivinayak Temple, Mahalaxmi Temple and Marine Drive. Overnight in Mumbai."},
    {day:2,title:"Mumbai to Alibaug",details:"Alibaug Beach, Kolaba Fort, Mandwa Jetty, Nagaon Beach and optional beach activities. Overnight in Alibaug."},
    {day:3,title:"Alibaug to Diveagar and Harihareshwar",details:"Diveagar Beach with optional activities, then Harihareshwar Beach and Shiva Temple. Overnight in Harihareshwar."},
    {day:4,title:"Harihareshwar to Ganpatipule",details:"Ganpatipule Beach, optional zipline over the Arabian Sea and Ganpatipule Ganpati Temple. Overnight in Ganpatipule."},
    {day:5,title:"Return to Mumbai",details:"After breakfast proceed towards Mumbai with an en-route lunch stop and evening airport or railway drop."}
  ]}),
  makeTour({slug:"pune-lonavala-mahabaleshwar-4-days",title:"Pune, Lonavala & Mahabaleshwar",duration:"3N/4D",destinations:["Pune","Lonavala","Pawna","Mahabaleshwar","Panchgani"],image:img.hills,itinerary:[
    {day:1,title:"Pune to Lonavala",details:"Pune airport or railway pickup, drive to Lonavala and local sightseeing. Overnight in Lonavala."},
    {day:2,title:"Lonavala and Pawna",details:"Pawna Lake, Lohagad Fort, Bhaja Caves and Karla Caves. Overnight in Lonavala."},
    {day:3,title:"Mahabaleshwar",details:"Check out after breakfast, drive to Mahabaleshwar and complete local sightseeing. Overnight in Mahabaleshwar."},
    {day:4,title:"Panchgani to Pune",details:"Check out, visit Panchgani for local sightseeing, then continue to Pune for an evening airport or railway drop."}
  ]}),
  makeTour({slug:"lonavala-khandala-3-days",title:"Lonavala & Khandala",duration:"2N/3D",destinations:["Lonavala","Khandala","Pawna"],image:img.hills,itinerary:[
    {day:1,title:"Lonavala Arrival",details:"Pickup and hotel check-in, then Tiger Point, Lion's Point and Bhushi Dam. Evening in the local market. Overnight in Lonavala."},
    {day:2,title:"Lonavala and Khandala",details:"Pawna Lake, Lohagad Fort, Bhaja Caves, Karla Caves and Khandala Sunset Point. Overnight in Lonavala."},
    {day:3,title:"Lonavala and Return",details:"After breakfast check out, visit the wax museum and Narayani Dham Temple, then railway station drop."}
  ]}),
  makeTour({slug:"mumbai-matheran-3-days",title:"Mumbai & Matheran",duration:"2N/3D",destinations:["Mumbai","Matheran","Karjat"],image:img.hills,notes:["Matheran is vehicle-free beyond Dasturi Naka and is reached by narrow-gauge train, horse or trek.","Bhivpuri Waterfalls are seasonal; ND Studios is the alternative visit."],itinerary:[
    {day:1,title:"Mumbai to Matheran",details:"Airport pickup and drive to Dasturi Naka, then toy train or horse ride to Matheran. Hotel check-in and evening sightseeing. Overnight in Matheran."},
    {day:2,title:"Matheran Sightseeing",details:"Panorama Point, Louisa Point, One Tree Hill Point, Alexander Point and Porcupine Point. Overnight in Matheran."},
    {day:3,title:"Matheran, Karjat and Return",details:"Check out, return to Dasturi Naka, then visit seasonal Bhivpuri Waterfalls or ND Studios in Karjat before the Mumbai airport drop."}
  ]}),
  makeTour({slug:"konkan-coast-5-days",title:"Konkan Coast: Dapoli to Tarkarli",duration:"4N/5D",destinations:["Dapoli","Ganpatipule","Tarkarli","Malvan","Devbag"],image:img.coast,notes:["Zipline, scuba diving, snorkelling, parasailing, dolphin safari and water activities are on a direct-payment basis."],itinerary:[
    {day:1,title:"Mumbai to Dapoli",details:"Mumbai pickup and drive to Dapoli. Hotel check-in, Karde Beach, Ladghar Beach and sunset. Overnight in Dapoli."},
    {day:2,title:"Dapoli to Ganpatipule",details:"Drive to Ganpatipule, hotel check-in, beach visit, optional zipline and Ganpatipule Ganpati Temple. Overnight in Ganpatipule."},
    {day:3,title:"Ganpatipule to Tarkarli and Malvan",details:"Drive to Tarkarli, check-in, Sindhudurg Fort, Tarkarli Beach, Rock Garden and optional marine activities. Overnight in Tarkarli or Malvan."},
    {day:4,title:"Devbag and Tsunami Island",details:"Devbag, Tsunami Island and Karli River backwaters with optional water activities. Overnight in Tarkarli."},
    {day:5,title:"Malvan to Mumbai",details:"After breakfast proceed towards Mumbai with an en-route lunch stop and evening airport or railway drop."}
  ]}),
  makeTour({slug:"mumbai-nashik-shirdi-3-days",title:"Mumbai, Nashik & Shirdi",duration:"2N/3D",destinations:["Mumbai","Nashik","Trimbakeshwar","Shirdi","Shani Shingnapur"],image:img.temple,itinerary:[
    {day:1,title:"Mumbai to Nashik",details:"Mumbai arrival and pickup, drive to Nashik, hotel check-in, Godavari Ghat, Panchvati, Ram Kund and Sita Gufa. Overnight in Nashik."},
    {day:2,title:"Trimbakeshwar to Shirdi",details:"After breakfast visit Trimbakeshwar Jyotirlinga and Kushavarta Kund. After lunch continue to Shirdi for evening temple darshan. Overnight in Shirdi."},
    {day:3,title:"Shani Shingnapur to Mumbai",details:"After breakfast visit Shani Shingnapur, then continue after lunch to Mumbai for an evening airport drop."}
  ]}),
  makeTour({slug:"mumbai-nashik-shirdi-aurangabad-6-days",title:"Mumbai, Nashik, Shirdi & Aurangabad",duration:"5N/6D",destinations:["Mumbai","Nashik","Shirdi","Aurangabad","Ellora","Ajanta"],image:img.caves,itinerary:[
    {day:1,title:"Mumbai to Nashik",details:"Mumbai pickup, drive to Nashik, then Godavari Ghat, Panchvati, Ram Kund, Sita Gufa and Muktidham Temple. Overnight in Nashik."},
    {day:2,title:"Trimbakeshwar to Shirdi",details:"Trimbakeshwar Jyotirlinga and Kushavarta Kund, then Shirdi evening darshan. Overnight in Shirdi."},
    {day:3,title:"Shani Shingnapur to Aurangabad",details:"Visit Shani Shingnapur, continue to Aurangabad, check in, then Bibi Ka Maqbara and Panchakki. Overnight in Aurangabad."},
    {day:4,title:"Ellora and Ghrishneshwar",details:"Ghrishneshwar Jyotirlinga, Ellora Caves, Sleeping Hanumanji, Daulatabad Fort and silk market. Overnight in Aurangabad."},
    {day:5,title:"Ajanta Caves Excursion",details:"Visit the UNESCO-listed Ajanta Caves. Evening at leisure or in the local market. Overnight in Chhatrapati Sambhajinagar."},
    {day:6,title:"Departure",details:"After breakfast check out and transfer to Mumbai airport."}
  ]}),
  makeTour({slug:"ashtavinayak-darshan-4-days",title:"Ashtavinayak Ganpati Darshan",duration:"3N/4D",destinations:["Mahad","Pali","Morgaon","Siddhatek","Theur","Ranjangaon","Ozar","Lenyadri"],image:img.temple,itinerary:[
    {day:1,title:"Mumbai to Mahad and Pali",details:"Mumbai arrival and pickup, Varad Vinayak darshan at Mahad, then Ballaleshwar darshan at Pali. Overnight in Lonavala or Pune."},
    {day:2,title:"Morgaon and Siddhatek",details:"Mayureshwar darshan at Morgaon, then Siddhivinayak darshan at Siddhatek. Return to Pune for the night."},
    {day:3,title:"Theur, Ranjangaon and Ozar",details:"Chintamani darshan at Theur, Mahaganpati at Ranjangaon and Vighnahar at Ozar. Overnight in Junnar or Ozar."},
    {day:4,title:"Lenyadri to Mumbai",details:"Girijatmaj darshan at Lenyadri, then continue to Mumbai for airport drop."}
  ]}),
  makeTour({slug:"mumbai-kolhapur-panhala-4-days",title:"Mumbai, Kolhapur & Panhala",duration:"3N/4D",destinations:["Mumbai","Kolhapur","Panhala"],image:img.fort,itinerary:[
    {day:1,title:"Mumbai to Kolhapur",details:"Mumbai pickup and drive to Kolhapur. Hotel check-in, Rankala Lake, Shalini Palace and local market for Kolhapuri chappals and handicrafts. Overnight in Kolhapur."},
    {day:2,title:"Kolhapur Sightseeing",details:"Mahalaxmi Temple, New Palace Museum, Bhavani Mandap and evening shopping. Overnight in Kolhapur."},
    {day:3,title:"Panhala Excursion",details:"Panhala Fort, Teen Darwaza, Sajja Kothi, Ambarkhana and Jyotiba Temple, then return to Kolhapur. Overnight in Kolhapur."},
    {day:4,title:"Kolhapur to Mumbai",details:"After breakfast proceed towards Mumbai with an en-route lunch stop and evening airport or railway drop."}
  ]}),
];

export const getTourBySlug = (slug) => tours.find((tour) => tour.slug === slug);
