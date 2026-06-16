// Indian Cities with Sub-Locations for Dropdown Menus
// Each city has popular areas/localities organized by category

export const INDIAN_CITIES = [
  // Maharashtra
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    coordinates: [19.0760, 72.8777],
    subLocations: {
      'Popular Areas': ['Andheri', 'Bandra', 'Juhu', 'Powai', 'Dadar', 'Worli', 'Lower Parel', 'Malabar Hill'],
      'North Mumbai': ['Borivali', 'Kandivali', 'Mira Road', 'Vasai', 'Naigaon', 'Bhayandar'],
      'Central Mumbai': ['Dadar', 'Byculla', 'CST Area', 'Kalbadevi', 'Marine Lines'],
      'South Mumbai': ['Colaba', 'Fort', 'CST', 'Gateway of India', 'Cuffe Parade'],
      'South Central': ['Parel', 'Worli', 'Prabhadevi', 'Mahalaxmi', 'Delisle Road'],
      'Western Suburbs': ['Andheri', 'Jogeshwari', 'Goregaon', 'Malad', 'Kandivali', 'Borivali'],
      'Eastern Suburbs': ['Vidyavihar', 'Kurla', 'Ghatkopar', 'Chembur', 'Mulund'],
      'Navi Mumbai': ['Vashi', 'Nerul', 'Belapur', 'Kharghar', 'Panvel', 'Airoli'],
    },
    metro: true,
    majorColleges: ['IIT Bombay', 'NIT Maharashtra'],
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    coordinates: [18.5204, 73.8567],
    subLocations: {
      'Central Pune': ['Shivajinagar', 'Deccan', 'Khadki', 'Pimpri'],
      'East Pune': ['Viman Nagar', 'Kalyani Nagar', 'Yerawada', 'Khadki'],
      'West Pune': ['Baner', 'Balewadi', 'Hinjewadi', 'Wakad', 'Pashan'],
      'North Pune': ['Kothrud', 'Warje', 'Karve Nagar', 'Bavdhan', 'Paud Road'],
      'South Pune': ['Katraj', 'Dhankawadi', 'Bibwewadi', 'Market Yard'],
      'IT Hubs': ['Hinjewadi Phase 1', 'Hinjewadi Phase 2', 'Hinjewadi Phase 3', 'Rajiv Gandhi Infotech Park'],
      'University Area': ['Ganeshkhind', 'Aundh', 'Pimple Nilakh', 'Baner'],
    },
    metro: true,
    majorColleges: ['MIT', 'COEP', 'Symbiosis', 'VIT Pune'],
  },
  {
    name: 'Nagpur',
    state: 'Maharashtra',
    coordinates: [21.1458, 79.0882],
    subLocations: {
      'Central': ['Sitabuldi', 'Mahatma Gandhi Road', 'Dharampeth', 'Lakadganj'],
      'North': ['Mahal', 'Gandhi Baug', 'Nandanvan', 'Chitnis Layout'],
      'South': ['Ayodhya Nagar', 'Somalwada', 'Besa', 'Pande Layout'],
      'East': ['Mitanpura', 'Manewada', 'Reshim Bagh', 'Lokmat Square'],
      'West': ['Dighori', 'Umred Road', 'Kamptee Road', 'Bhelpur'],
    },
    metro: false,
    majorColleges: ['VNIT', 'Rashtriya Millimet'],
  },
  {
    name: 'Thane',
    state: 'Maharashtra',
    coordinates: [19.2183, 72.9781],
    subLocations: {
      'Central Thane': ['Castle Mill', 'Lokmanya Nagar', 'Naupada', 'Shivaji Nagar'],
      'East Thane': ['Kopri', 'Kalwa', 'Mumbra', 'Parshi'],
      'West Thane': ['Waghbil', 'Godbunder Road', 'Kasarvadavali', 'Anjur Phata'],
      'North Thane': ['Dombivli', 'Kalyan', 'Ulhasnagar', 'Ambernath'],
      'South Thane': ['Bhayander', 'Mira Road', 'Dahisar', 'Kandivali East'],
    },
    metro: true,
    majorColleges: [],
  },

  // Delhi NCR
  {
    name: 'Delhi',
    state: 'Delhi',
    coordinates: [28.6139, 77.2090],
    subLocations: {
      'Central Delhi': ['Connaught Place', 'Karol Bagh', 'Rajendra Place', 'Patel Nagar', 'Jhandewalan'],
      'New Delhi': ['Lajpat Nagar', 'Saket', 'Hauz Khas', 'Greater Kailash', 'Nehru Place'],
      'North Delhi': ['Rohini', 'Pitampura', 'Shalimar Bagh', 'Model Town', 'Civil Lines'],
      'South Delhi': ['Vasant Kunj', 'Mehrauli', 'Chhatarpur', 'Saket', 'Malviya Nagar'],
      'East Delhi': ['Mayur Vihar', 'Preet Vihar', 'Karkardooma', 'Laxmi Nagar', 'Pardesh'],
      'West Delhi': ['Rajouri Garden', 'Janakpuri', 'Vikaspuri', 'Paschim Vihar', 'Tilak Nagar'],
      'North West': ['Dwarka', 'Janakpuri', 'Uttam Nagar', 'Najafgarh', 'Palam'],
      'Gurgaon': ['Cyber City', 'DLF Phase 1', 'DLF Phase 2', 'Golf Course Road', 'Sohna Road'],
      'Noida': ['Sector 18', 'Sector 62', 'Sector 128', 'Greater Noida', 'Expressway'],
    },
    metro: true,
    majorColleges: ['IIT Delhi', 'IIIT Delhi', 'Delhi University', 'JNU', 'NIT Delhi'],
  },
  {
    name: 'Noida',
    state: 'Uttar Pradesh',
    coordinates: [28.5355, 77.3910],
    subLocations: {
      'Sector 1-20': ['Sector 18', 'Sector 15', 'Sector 16', 'Sector 12', 'Sector 11'],
      'Sector 21-50': ['Sector 25', 'Sector 32', 'Sector 37', 'Sector 41', 'Sector 50'],
      'Sector 51-80': ['Sector 62', 'Sector 63', 'Sector 50', 'Sector 55', 'Sector 56'],
      'Sector 81-100': ['Sector 78', 'Sector 83', 'Sector 93', 'Sector 97', 'Sector 100'],
      'Greater Noida': ['Alpha 1', 'Alpha 2', 'Beta 1', 'Gamma 1', 'Knowledge Park'],
      'Expressway': ['Jaypee Greens', 'Pari Chowk', 'Koin儿', 'NRI City'],
    },
    metro: true,
    majorColleges: [],
  },
  {
    name: 'Gurgaon',
    state: 'Haryana',
    coordinates: [28.4595, 77.0266],
    subLocations: {
      'Phase 1': ['DLF Phase 1', 'Sikanderpur', 'MGF Metropolitan', 'Central Park'],
      'Phase 2': ['Udyog Vihar', 'Phase 2 Industrial', 'Pioneer Park'],
      'Phase 3': ['DLF Phase 3', 'Sector 14', 'Old Gurgaon'],
      'Phase 4-5': ['DLF Phase 4', 'Sector 28', 'Mehrauli Road'],
      'Phase 6-7': ['DLF Phase 5', 'Golf Course Road', 'Golf Course Extension'],
      'New Gurgaon': ['Sohna Road', 'Dwarka Expressway', 'New Colony', 'Basai'],
      'Golf Course': ['Golf Course Road', 'Golf Course Extension', 'Southern Peripheral Road'],
    },
    metro: true,
    majorColleges: [],
  },

  // Karnataka
  {
    name: 'Bangalore',
    state: 'Karnataka',
    coordinates: [12.9716, 77.5946],
    subLocations: {
      'Central Bangalore': ['MG Road', 'Brigade Road', 'Church Street', 'Residency Road', 'Ashok Nagar'],
      'South Bangalore': ['Jayanagar', 'JP Nagar', 'BTM Layout', 'Banashankari', 'Koramangala'],
      'East Bangalore': ['Whitefield', 'Marathahalli', 'Indiranagar', 'CV Raman Nagar', 'Old Airport Road'],
      'West Bangalore': ['Rajajinagar', 'Mahalakshmi Layout', 'Vijay Nagar', 'Yeshwanthpur', 'Magadi Road'],
      'North Bangalore': ['Hebbal', 'Yelahanka', 'RT Nagar', 'Sadashivanagar', 'Malleshwaram'],
      'IT Hub South': ['Electronic City Phase 1', 'Electronic City Phase 2', 'Hosur Road', 'Bommasandra'],
      'IT Hub East': ['Whitefield ITPL', 'Mahadevapura', 'Marathahalli', 'HAL', 'Domlur'],
      'New Areas': ['Sarjapur Road', 'Hebbal Flyover', 'Devanahalli', 'Nelmangala'],
    },
    metro: true,
    majorColleges: ['IIT Bangalore', 'IIIT Bangalore', 'BMS College', 'RV College', 'Christ University'],
  },

  // Tamil Nadu
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    coordinates: [13.0827, 80.2707],
    subLocations: {
      'Central Chennai': ['T Nagar', 'Nungambakkam', 'Anna Nagar', 'Kilpauk', 'Mylapore'],
      'North Chennai': ['Tondiarpet', 'Thiruvottiyur', 'Manali', 'Madhavaram', 'Kodungaiyur'],
      'South Chennai': ['Adyar', 'Guindy', 'Velachery', 'Taramani', 'Perungudi'],
      'East Chennai': ['Omr', 'Sholinganallur', 'Medavakkam', 'Kottivakkam', 'Ullagaram'],
      'West Chennai': ['Porur', 'Iyyappanthangal', 'Kumananchavadi', 'Poonamallee', 'Avadi'],
      'IT Corridors': ['OMR (IT Highway)', 'Sriperumbudur', 'Chennai Outer Ring Road', 'Mahindra World City'],
      'University Area': ['Guindy', 'Madhavaram', 'Chennai Central'],
      'Coastal': ['Marina Beach', 'Besant Nagar', 'Neelankarai', 'Covelong'],
    },
    metro: true,
    majorColleges: ['IIT Madras', 'Anna University', 'SRM', 'VIT Chennai', 'SSN'],
  },

  // Telangana
  {
    name: 'Hyderabad',
    state: 'Telangana',
    coordinates: [17.3850, 78.4867],
    subLocations: {
      'Old City': ['Charminar', 'Golconda', 'Secunderabad', 'Abids', 'Koti'],
      'Central Hyderabad': ['Banjara Hills', 'Jubilee Hills', 'Humayun Nagar', 'Masarbagh'],
      'North Hyderabad': ['Kukatpally', 'Hitech City', 'Miyapur', 'Balanagar', 'Jeedimetla'],
      'South Hyderabad': ['Gachibowli', 'Financial District', 'Kismatpur', 'Rajendra Nagar'],
      'East Hyderabad': ['Kompally', 'Medchal', 'Shamirpet', 'Bowl Bowli'],
      'West Hyderabad': ['Mehdipatnam', 'Attapur', 'Uppal', 'LB Nagar', 'Vijayawada Highway'],
      'IT Hub': ['Cyberabad (Hitech City)', 'Gachibowli', 'Manikonda', 'Kondapur', 'Madhapur'],
      'Airport Highway': ['Shamshabad', 'RGIA Airport', 'Moinabad', 'Shankarpalli'],
    },
    metro: true,
    majorColleges: ['IIT Hyderabad', 'IIIT Hyderabad', 'JNTU', 'BITS Hyderabad'],
  },

  // West Bengal
  {
    name: 'Kolkata',
    state: 'West Bengal',
    coordinates: [22.5726, 88.3639],
    subLocations: {
      'Central Kolkata': ['Park Street', 'Bhowanipore', 'Maidan', 'Esplanade', 'College Street'],
      'North Kolkata': ['Shyambazar', 'Bagbazar', 'Gariahat', 'Tollygunge', 'Jodhpur Park'],
      'South Kolkata': ['Ballygunge', 'Alipore', 'New Alipore', 'Lake Town', 'Salt Lake'],
      'East Kolkata': ['Bidhannagar', 'Salt Lake Sector 1-5', 'Rajarhat', 'Newtown'],
      'West Kolkata': ['Howrah', 'Santragachi', 'Liluah', 'Bardhaman Highway'],
      'North 24 Parganas': ['Barasat', 'Barrackpore', 'Madhyamgram', 'Rajarhat'],
      'University Area': ['College Street', 'Bhowanipore', 'Rashbehari'],
    },
    metro: true,
    majorColleges: ['IIT Kharagpur', 'Jadavpur University', 'Calcutta University'],
  },

  // Gujarat
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    coordinates: [23.0225, 72.5714],
    subLocations: {
      'Central': ['CG Road', 'Navrangpura', 'Ambawadi', 'Vastrapur', 'Mahalaxmi Cross Road'],
      'East Ahmedabad': ['Bapunagar', 'Naroda', 'GIDC Naroda', 'Karnavati'],
      'West Ahmedabad': ['Satellite', 'Vastrapur Lake', 'Bodakdev', 'Thaltej', 'Shela'],
      'South Ahmedabad': ['Navsari Bazaar', 'Gulab Tower', 'Sola Cross Road', 'Science City'],
      'North Ahmedabad': ['Gota Cross Road', 'Chandlai', 'Vastal'],
      'SG Highway': ['Sarkhej-Gandhinagar Highway', 'Gota', 'Zundal'],
      'Gandhinagar': ['Sector 1-15', 'Gandhinagar Capital', 'Infocity'],
    },
    metro: true,
    majorColleges: ['IIM Ahmedabad', 'NIT Gujarat', 'LD College'],
  },

  // Rajasthan
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    coordinates: [26.9124, 75.7873],
    subLocations: {
      'Central Jaipur': ['MI Road', 'Johari Bazaar', 'Chandpole', 'Sanganer Gate'],
      'North Jaipur': ['MI Road North', 'Ramganj', 'Ajmeri Gate', 'Sindhi Camp'],
      'South Jaipur': ['Sanganer', 'Pratap Nagar', 'Muralipura', 'Bassi'],
      'East Jaipur': ['Vaishali Nagar', 'Amrapali Road', 'Vidyadhar Nagar', 'Sahakar Marg'],
      'West Jaipur': ['Gopalpura Bypass', 'Triveni Nagar', 'Murlipura', 'Riico'],
      'New Jaipur': ['Jagatpura', 'Mahal Road', 'DB Road', 'Sanjay Gandhi Nagar'],
      'Amer Area': ['Amer', 'Makkawala', 'Jaipur National University'],
    },
    metro: true,
    majorColleges: ['MNIT Jaipur', 'NIT Jaipur', 'BITS Jaipur'],
  },

  // Uttar Pradesh
  {
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    coordinates: [26.8467, 80.9462],
    subLocations: {
      'Central Lucknow': ['Hazratganj', 'Aminabad', 'Lalbagh', 'Charbagh'],
      'North Lucknow': ['Mahanagar', 'Alambagh', 'Chowk', 'Sarfarazganj'],
      'South Lucknow': ['Indiranagar', 'Jankipuram', 'Vikas Nagar', 'Kalyanpur'],
      'East Lucknow': ['Chinhat', 'Vinam Khand', 'Gomti Nagar', 'Nishatganj'],
      'West Lucknow': ['Alambagh', 'Kursi Road', 'Jalandhar Byepass', 'Faizabad Road'],
      'New Lucknow': ['Amar Shaheed Path', 'Kanpur Road', 'SITapur Road'],
    },
    metro: false,
    majorColleges: ['IIT Lucknow', 'IIM Lucknow', 'MNNIT'],
  },
  {
    name: 'Kanpur',
    state: 'Uttar Pradesh',
    coordinates: [26.4499, 80.3319],
    subLocations: {
      'Central': ['Moti Jheel', 'Nawabganj', 'Civil Lines', 'Swaroop Nagar'],
      'North': ['Kakadeo', 'Bithoor Road', 'Jajmau', 'Panki'],
      'South': ['Ratanpur', 'Bara Gaon', 'Bairi Sher Khan', 'Kalyanpur'],
      'East': ['Govind Nagar', 'Harsh Nagar', 'Chunniganj', 'Ashok Nagar'],
      'West': ['Vikas Nagar', 'Vishnupuri', 'Birhana Road', 'Geeta Nagar'],
    },
    metro: false,
    majorColleges: ['IIT Kanpur'],
  },
  {
    name: 'Meerut',
    state: 'Uttar Pradesh',
    coordinates: [28.9845, 77.7064],
    subLocations: {
      'Central Meerut': ['Station Road', 'Sakoti Chauraha', 'Jauhri Circle', 'Ghazi Chowk'],
      'North Meerut': ['Mawana Road', 'Kankerkhera', 'Medical College', 'Begrajpur'],
      'South Meerut': ['Modipuram', 'Partapur', 'Rithani', 'Mawana'],
      'East Meerut': ['Kurali', 'Lakhnawi', 'Syedshahpur', 'Khair'],
      'West Meerut': ['Daurala', 'Mawana Kalan', 'Sardhana', 'Maqsoodpur'],
      'Universities': ['IIT Meerut', 'Meerut College', 'VS Institute', 'Shobhit University'],
    },
    metro: false,
    majorColleges: ['IIT Meerut', 'Meerut College'],
  },
  {
    name: 'Agra',
    state: 'Uttar Pradesh',
    coordinates: [27.1767, 78.0081],
    subLocations: {
      'Taj Area': ['Taj Mahal', 'Mehrauli', 'Fatehabad Road', 'Bambay'],
      'Central Agra': ['Sanjak Bazar', 'Kinari Bazar', 'Mughal Street', 'Belanganj'],
      'North Agra': ['Kamla Nagar', 'Shahganj', 'Lohamandi', 'Nai Sarak'],
      'South Agra': ['Sikandra', 'Khandoli', 'Arjun Nagar', 'Tajganj'],
      'Universities': ['IIT Agra', 'Dr. Bhim Rao University', 'Agra College'],
    },
    metro: true,
    majorColleges: ['IIT Agra', ' Agra College'],
  },

  // Kerala
  {
    name: 'Kochi',
    state: 'Kerala',
    coordinates: [9.9312, 76.2673],
    subLocations: {
      'Central Kochi': ['MG Road', 'Marine Drive', 'Discs', 'L使馆区'],
      'North Kochi': ['Kalamassery', 'Edapally', 'Vypeen', 'Fort Kochi'],
      'South Kochi': ['Panampilly Nagar', 'Kadavanthra', 'Elamkulam', 'Vyttila'],
      'Old Kochi': ['Fort Kochi', 'Mattancherry', 'Kochi Marina', 'Vypeen Beach'],
      'IT Hub': ['Kakkanad', 'Infopark', 'Kochi Metro', 'Smart City'],
      'Marina Area': ['Marine Drive', 'Vallarpadam', 'Ernamkulam'],
      'Perumbavoor Road': ['Kalamassery', 'North Paravoor', 'Perumbavoor'],
    },
    metro: true,
    majorColleges: ['Cochin University', 'St. Albert College'],
  },

  // Andhra Pradesh / Telangana
  {
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    coordinates: [17.6868, 83.2185],
    subLocations: {
      'Central': ['Dwaraka Nagar', 'MVP Colony', 'Gajuwaka', 'NAD Junction'],
      'Beach Road': ['RK Beach', 'Rushikonda', 'Bheemili Beach', 'Sagar Nagar'],
      'North': ['Anakapalli', 'Sabbavaram', 'Parawada'],
      'East': ['Gopalapatnam', 'Bheemunipatnam', 'Marlavaram'],
      'IT Hub': ['Gajuwaka SEZ', 'Infosys Campus', 'FinTech City'],
      'Port Area': ['Port Trust', 'Dockyard', 'Gangavaram Port'],
    },
    metro: false,
    majorColleges: ['NIT Andhra Pradesh'],
  },

  // Punjab
  {
    name: 'Chandigarh',
    state: 'Chandigarh',
    coordinates: [30.7333, 76.7794],
    subLocations: {
      'Sector 1-17': ['Sector 15', 'Sector 17', 'Sector 22', 'Sector 35'],
      'Sector 18-30': ['Sector 26', 'Sector 29', 'Sector 43', 'Sector 49'],
      'Sector 31-47': ['Sector 37', 'Sector 41', 'Sector 44', 'Sector 52'],
      'North Mohali': ['Phase 1-3', 'Sector 62', 'Aerocity'],
      'South Panchkula': ['Sector 12', 'Sector 14', 'Sector 20'],
      'Punjab University': ['PU Campus', 'Hostel Block', 'Gopal Nagar'],
    },
    metro: false,
    majorColleges: ['Punjab University', 'Chitkara University'],
  },
  {
    name: 'Ludhiana',
    state: 'Punjab',
    coordinates: [30.9010, 75.8573],
    subLocations: {
      'Central': ['Clock Tower', 'Chaura Bazar', 'Sunder Nagar', 'Field Ganj'],
      'East': ['Industrial Area', 'Daba Road', 'Shimlapuri', 'Haibowal'],
      'West': ['Feroze Gandhi Market', 'Miller Ganj', 'Jassowal'],
      'North': ['Civil Lines', 'Pakhowal Road', 'Dugri', 'Model Town'],
      'South': ['Samrala Road', 'Chandigarh Road', 'Gill Road'],
    },
    metro: false,
    majorColleges: ['PAU Ludhiana', 'GNDEC'],
  },

  // Others
  {
    name: 'Bhubaneswar',
    state: 'Odisha',
    coordinates: [20.2961, 85.8245],
    subLocations: {
      'Central': ['Unit 1', 'Unit 3', 'Bapuji Nagar', 'Sahid Nagar'],
      'New Bhubaneswar': ['Nayapalli', 'Jaydev Vihar', 'Kharvela Nagar', 'Chandrasekharpur'],
      'Old Town': ['Old Town', 'Lingaraj Temple Area', 'Mangalabag'],
      'IT/Infra': ['Infovalley', 'Patia', 'Kalinga Nagar', 'Raghunathpur'],
      'Banking/Finance': ['Financial District', 'RCR', 'Kalinga'],
    },
    metro: false,
    majorColleges: ['AIIMS Bhubaneswar', 'NIT Rourkela', 'Utkal University'],
  },
  {
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    coordinates: [11.0168, 76.9558],
    subLocations: {
      'Central': ['RS Puram', 'Gandhipuram', 'Town Hall', 'Big Bazaar Street'],
      'North': ['Peelamedu', 'Nava India', 'Singanallur', 'SIDCO'],
      'South': ['Vadavalli', 'Thondamuthur', 'Madukkarai', 'Periyannegam'],
      'East': ['Saravanampatti', 'Chinnavedampatti', 'Pothampalayam'],
      'West': ['Mettupalayam Road', 'Kuniyamuthur', 'Kurichi', 'Palghat'],
      'UKK Road': ['UkKadam', 'Vellalore', 'Madhavaram'],
      'IT Parks': ['KCT Tech Park', 'TIDEL Park', 'KGiSL Campus'],
    },
    metro: false,
    majorColleges: ['PSG College', 'Coimbatore Institute', 'Amrita Vishwa'],
  },
  {
    name: 'Indore',
    state: 'Madhya Pradesh',
    coordinates: [22.7196, 75.8577],
    subLocations: {
      'Central': ['Rajwada', 'Sarafa', 'Lasudia', 'Nehru Stadium'],
      'New Indore': ['Vijay Nagar', 'Scheme No 54', 'AB Road', 'Palasia'],
      'South Indore': ['Bengali Square', 'Rajendra Nagar', 'Bhawrasla', 'Rau'],
      'East Indore': ['LIG Square', 'Bijalpur', 'Nipania', 'MR 10 Road'],
      'West Indore': ['Kanadiya Road', 'Mhow Road', 'Ralamandal'],
      'Residency Area': ['Bapat Square', 'L I G', 'M A Road'],
    },
    metro: false,
    majorColleges: ['IIT Indore', 'DAVV'],
  },
  {
    name: 'Vadodara',
    state: 'Gujarat',
    coordinates: [22.3072, 73.1812],
    subLocations: {
      'Central': ['Alkapuri', 'Sayajigunj', 'Karelibaug', 'Fatehgunj'],
      'North': ['Gotri', 'Harni', 'Tarsali', 'Tandalja'],
      'South': ['Akota', 'Vasna Road', 'Waghodia Road', 'Dabhoi Road'],
      'East': ['Manjalpur', 'Ellora Park', 'Sama', 'Kalali'],
      'West': ['Nizampura', 'Fatehgunj', 'Pratapnagar'],
    },
    metro: false,
    majorColleges: ['MS University', 'NIT Gujarat'],
  },
  {
    name: 'Trivandrum',
    state: 'Kerala',
    coordinates: [8.5241, 76.9366],
    subLocations: {
      'Central': ['Palayam', 'Statue', 'Kowdiar', 'Kowdiar Square'],
      'North': ['Killy', 'Pattom', 'Karamana', 'Poojapura'],
      'South': ['Kovalam', 'Vizhinjam', 'Muttathara', 'Vellanad'],
      'East': ['Kattakada', 'Neyyattinkara', 'Vellanad', 'Pallikkal'],
      'Tech Park': ['Technopark', 'Kazhakkoottam', 'Kinfra'],
      'Beach Area': ['Kovalam', 'Shanghumukham', 'Veli'],
    },
    metro: false,
    majorColleges: ['IIST Trivandrum', 'University of Kerala'],
  },
  {
    name: 'Surat',
    state: 'Gujarat',
    coordinates: [21.1702, 72.8311],
    subLocations: {
      'Central': ['Mormugao', 'Udhna', 'Amroli', 'Navsari Bazaar'],
      'East Surat': ['Udhna', 'Pandesara', 'Bhesan', 'San Jan'],
      'West Surat': ['Adajan', 'Pal', 'Rander', 'Katargam'],
      'North Surat': ['Vyara', 'Mota Varachha', 'Karanj', 'Kim'],
      'South Surat': ['Dabholi', 'Bardoli', 'Madhi', 'Bardoli Road'],
      'Textile City': ['New Textile Market', 'Ring Road', 'Shahpore'],
    },
    metro: false,
    majorColleges: ['SVNIT Surat'],
  },
  {
    name: 'Rajkot',
    state: 'Gujarat',
    coordinates: [22.3039, 70.8022],
    subLocations: {
      'Central': ['Astron Chowk', 'Indira Circle', '150 Feet Road', 'Kalawad Road'],
      'East': ['Kothariya', 'Karanpara', 'Saurashtra University', 'Vavdi'],
      'West': ['150 Feet Road', 'Kalawad Road', 'Airport Road'],
      'South': ['Kothariya', 'GIDC', 'Shapar', 'Veraval'],
      'North': ['Raiya Road', 'Kuvadva', 'Gondal Road'],
    },
    metro: false,
    majorColleges: ['NIT Rajkot'],
  },
  // Rajasthan
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    coordinates: [26.9124, 75.7873],
    subLocations: {
      'Central': ['Pink City', 'MI Road', 'Nehru Place', 'Ashok Nagar'],
      'East': ['Malviya Nagar', 'Jawahar Nagar', 'Bapu Nagar', 'Mansarovar'],
      'West': ['Vaishali Nagar', 'Shyam Nagar', 'Sodala', 'C-Scheme'],
      'South': ['Tonk Road', 'Sanganer', 'Sitapura', 'Pratap Nagar'],
      'North': ['Jhotwara', 'Vidhyadhar Nagar', 'Amber', 'Nahargarh'],
    },
    metro: false,
    majorColleges: ['MNIT Jaipur', 'BIT Jaipur'],
  },
  {
    name: 'Jodhpur',
    state: 'Rajasthan',
    coordinates: [26.2389, 73.0243],
    subLocations: {
      'Central': ['Sardarpura', 'Paota', 'Railway Colony', 'Nai Sarak'],
      'East': ['Pal Road', 'Shastri Nagar', 'Residency Road'],
      'West': ['Chopsani', 'Ratanada', 'Defence Colony'],
    },
    metro: false,
    majorColleges: ['IIT Jodhpur', 'NIFT Jodhpur'],
  },
  {
    name: 'Udaipur',
    state: 'Rajasthan',
    coordinates: [24.5854, 73.7125],
    subLocations: {
      'Central': ['Fatehpura', 'Hiran Magri', 'Sukher', 'Bhupalpura'],
      'East': ['Goverdhan Vilas', 'University Road'],
      'West': ['Ambamata', 'Madhuban', 'Shobhagpura'],
    },
    metro: false,
    majorColleges: ['IIM Udaipur'],
  },
  // Madhya Pradesh
  {
    name: 'Bhopal',
    state: 'Madhya Pradesh',
    coordinates: [23.2599, 77.4126],
    subLocations: {
      'Central': ['MP Nagar', 'Arera Colony', 'New Market', 'TT Nagar'],
      'East': ['BHEL', 'Kolar Road', 'Hoshangabad Road'],
      'West': ['Indrapuri', 'Shahpura', 'Bairagarh'],
      'North': ['Gandhi Nagar', 'Govindpura', 'Piplani'],
      'South': ['Habibganj', 'AIIMS Area', 'Kolar'],
    },
    metro: false,
    majorColleges: ['IISER Bhopal', 'MANIT', 'AIIMS Bhopal'],
  },
  {
    name: 'Indore',
    state: 'Madhya Pradesh',
    coordinates: [22.7196, 75.8577],
    subLocations: {
      'Central': ['Vijay Nagar', 'Sapna Sangeeta', 'Palasia', 'Bhawarkuan'],
      'East': ['Bengali Square', 'Rajmohalla', 'Annapurna'],
      'West': ['Nipania', 'Super Corridor', 'MR 10 Road'],
      'South': ['Rau', 'Ralamandal', 'Bicholi Mardana'],
    },
    metro: false,
    majorColleges: ['IIM Indore', 'IIT Indore'],
  },
  // Punjab
  {
    name: 'Chandigarh',
    state: 'Chandigarh',
    coordinates: [30.7333, 76.7794],
    subLocations: {
      'Sectors': ['Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Sector 8'],
      'North': ['Manimajra', 'Panchkula', 'Kalka'],
      'South': ['Mohali', 'Zirakpur', 'Dhakoli'],
      'University Area': ['Panjab University', 'Sector 14', 'Sector 25'],
    },
    metro: false,
    majorColleges: ['PEC Chandigarh', 'Panjab University'],
  },
  {
    name: 'Ludhiana',
    state: 'Punjab',
    coordinates: [30.9010, 75.8573],
    subLocations: {
      'Central': ['Clock Tower', 'Mall Road', 'Gill Road', 'Model Town'],
      'East': ['Sarabha Nagar', 'Pakhowal Road', 'BRS Nagar'],
      'West': ['Civil Lines', 'Feroze Gandhi Market'],
    },
    metro: false,
    majorColleges: ['GNE College', 'Lovely Professional University'],
  },
  {
    name: 'Amritsar',
    state: 'Punjab',
    coordinates: [31.6340, 74.8723],
    subLocations: {
      'Central': ['Golden Temple', 'Hall Bazaar', 'Lawrence Road', 'Albert Road'],
      'East': ['Ranjit Avenue', 'Gumtala', 'Loharka'],
      'West': ['Kabalpura', 'G.T. Road', 'Basant Avenue'],
    },
    metro: false,
    majorColleges: ['Guru Nanak Dev University'],
  },
  // Haryana
  {
    name: 'Gurugram',
    state: 'Haryana',
    coordinates: [28.4595, 77.0266],
    subLocations: {
      'Central': ['Sector 14', 'Sector 29', 'DLF Phase 1', 'Sushant Lok'],
      'DLF Areas': ['DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4', 'DLF Phase 5'],
      'Sohna Road': ['Sector 33', 'Sector 48', 'Sector 69', 'Sector 70'],
      'New Gurugram': ['Sector 82', 'Sector 84', 'Sector 92', 'Dwarka Expressway'],
      'MG Road': ['IFFCO Chowk', 'Sikanderpur', 'Galleria Market'],
    },
    metro: true,
    majorColleges: ['MDI Gurugram'],
  },
  {
    name: 'Faridabad',
    state: 'Haryana',
    coordinates: [28.4089, 77.3178],
    subLocations: {
      'Central': ['Sector 15', 'Sector 16', 'NIT', 'Old Faridabad'],
      'North': ['Ballabgarh', 'Tigaon Road'],
      'South': ['Neharpar', 'Greater Faridabad', 'Sector 75-89'],
    },
    metro: false,
    majorColleges: ['YMCA Faridabad'],
  },
  // Kerala
  {
    name: 'Kochi',
    state: 'Kerala',
    coordinates: [9.9312, 76.2673],
    subLocations: {
      'Central': ['Ernakulam', 'MG Road', 'Broadway', 'Fort Kochi'],
      'East': ['Kakkanad', 'Infopark', 'Edappally', 'Palarivattom'],
      'West': ['Mattancherry', 'Willingdon Island', 'Vypin'],
      'South': ['Tripunithura', 'Thiruvankulam', 'Kundannoor'],
    },
    metro: false,
    majorColleges: ['Cochin University', 'CUSAT'],
  },
  {
    name: 'Trivandrum',
    state: 'Kerala',
    coordinates: [8.5241, 76.9366],
    subLocations: {
      'Central': ['Palayam', 'Kowdiar', 'MG Road', 'Statue'],
      'East': ['Technopark', 'Kazhakootam', 'Sreekaryam'],
      'West': ['Shanghumukham', 'Vattiyoorkavu', 'Peroorkada'],
    },
    metro: false,
    majorColleges: ['IIST', 'IISER TVM', 'CET'],
  },
  // Bihar
  {
    name: 'Patna',
    state: 'Bihar',
    coordinates: [25.6093, 85.1376],
    subLocations: {
      'Central': ['Boring Road', 'Fraser Road', 'Exhibition Road', 'Gandhi Maidan'],
      'East': ['Kankarbagh', 'Patliputra', 'Rajendra Nagar'],
      'West': ['Danapur', 'Bihta', 'Digha'],
      'South': ['Bailey Road', 'Indrapuri', 'Saguna More'],
    },
    metro: false,
    majorColleges: ['IIT Patna', 'NIT Patna'],
  },
  // Odisha
  {
    name: 'Bhubaneswar',
    state: 'Odisha',
    coordinates: [20.2961, 85.8245],
    subLocations: {
      'Central': ['Rajmahal Square', 'Unit 1 Market', 'Jaydev Vihar', 'Sahid Nagar'],
      'East': ['Chandrasekharpur', 'Patia', 'Sailashree Vihar'],
      'West': ['Khandagiri', 'Tamando', 'Infocity'],
      'South': ['Nayapalli', 'Madhusudan Nagar'],
    },
    metro: false,
    majorColleges: ['IIT Bhubaneswar', 'KIIT University'],
  },
  // Jharkhand
  {
    name: 'Ranchi',
    state: 'Jharkhand',
    coordinates: [23.3441, 85.3096],
    subLocations: {
      'Central': ['Main Road', 'Church Road', 'Lalpur', 'Doranda'],
      'East': ['Hinoo', 'Harmu Housing Colony', 'Ashok Nagar'],
      'West': ['Ratu Road', 'Piska More', 'Hatia'],
    },
    metro: false,
    majorColleges: ['IIT ISM Dhanbad', 'BIT Mesra'],
  },
  // Chhattisgarh
  {
    name: 'Raipur',
    state: 'Chhattisgarh',
    coordinates: [21.2514, 81.6296],
    subLocations: {
      'Central': ['Civil Lines', 'Malviya Road', 'Telibandha', 'Shankar Nagar'],
      'East': ['NIT Raipur', 'GE Road'],
      'West': ['Devendra Nagar', 'Vidhan Sabha Road'],
    },
    metro: false,
    majorColleges: ['NIT Raipur', 'AIIMS Raipur'],
  },
  // Uttarakhand
  {
    name: 'Dehradun',
    state: 'Uttarakhand',
    coordinates: [30.3165, 78.0322],
    subLocations: {
      'Central': ['Rajpur Road', 'Clock Tower', 'Paltan Bazaar', 'Race Course'],
      'East': ['Prem Nagar', 'IT Park', 'Sahastradhara Road'],
      'West': ['Clement Town', 'Patel Nagar', 'Ballupur'],
    },
    metro: false,
    majorColleges: ['IIT Roorkee (nearby)', 'FRI Dehradun'],
  },
  // Goa
  {
    name: 'Panaji',
    state: 'Goa',
    coordinates: [15.4909, 73.8278],
    subLocations: {
      'Central': ['MG Road', '18th June Road', 'Miramar', 'Dona Paula'],
      'North': ['Mapusa', 'Calangute', 'Anjuna', 'Baga'],
      'South': ['Margao', 'Vasco da Gama', 'Ponda'],
    },
    metro: false,
    majorColleges: ['BITS Pilani Goa', 'Goa Engineering College'],
  },
  {
    name: 'Margao',
    state: 'Goa',
    coordinates: [15.2832, 73.9862],
    subLocations: {
      'Central': ['Gogol', 'Comba', 'Monte Hill'],
      'North': ['Cuncolim', 'Navelim'],
      'South': ['Benaulim', 'Colva', 'Varca'],
    },
    metro: false,
    majorColleges: [],
  },
  // Assam
  {
    name: 'Guwahati',
    state: 'Assam',
    coordinates: [26.1445, 91.7362],
    subLocations: {
      'Central': ['GS Road', 'Paltan Bazaar', 'Fancy Bazaar', 'Silpukhuri'],
      'East': ['Dispur', 'Beltola', 'Six Mile'],
      'West': ['Jalukbari', 'Azara', 'IIT Guwahati'],
      'South': ['Lokhra', 'Soneswar', 'Basistha'],
    },
    metro: false,
    majorColleges: ['IIT Guwahati', 'NIT Silchar'],
  },
  // Jammu & Kashmir
  {
    name: 'Srinagar',
    state: 'Jammu & Kashmir',
    coordinates: [34.0837, 74.7973],
    subLocations: {
      'Central': ['Lal Chowk', 'Residency Road', 'Dal Gate', 'Boulevard'],
      'East': ['Nigeen', 'Hazratbal', 'Sonwar'],
      'West': ['Nowshera', 'Baramulla Road', 'Bemina'],
    },
    metro: false,
    majorColleges: ['NIT Srinagar', 'University of Kashmir'],
  },
  // Himachal Pradesh
  {
    name: 'Shimla',
    state: 'Himachal Pradesh',
    coordinates: [31.1048, 77.1734],
    subLocations: {
      'Central': ['Mall Road', 'Ridge', 'Lower Bazaar', 'Lakkar Bazaar'],
      'East': ['Sanjauli', 'Dhalli', 'Kufri'],
      'West': ['Chhota Shimla', 'Kushti', 'Tutikandi'],
    },
    metro: false,
    majorColleges: ['IIIT Una', 'HPU Shimla'],
  },
  // Andhra Pradesh
  {
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    coordinates: [17.6868, 83.2185],
    subLocations: {
      'Central': ['Beach Road', 'Jagadamba', 'Dwaraka Nagar', 'Siripuram'],
      'East': ['MVP Colony', 'Seethammadhara', 'Rushikonda'],
      'West': ['Gajuwaka', 'Gopalapatnam', 'NAD Junction'],
    },
    metro: false,
    majorColleges: ['Andhra University', 'IIM Visakhapatnam'],
  },
  {
    name: 'Vijayawada',
    state: 'Andhra Pradesh',
    coordinates: [16.5062, 80.6480],
    subLocations: {
      'Central': ['Benz Circle', 'Bandar Road', 'MG Road', 'Labbipet'],
      'East': ['Gunadala', 'Patamata'],
      'West': ['Gollapudi', 'Ibrahimpatnam'],
    },
    metro: false,
    majorColleges: ['NIT Andhra Pradesh'],
  },
  // Telangana additional
  {
    name: 'Warangal',
    state: 'Telangana',
    coordinates: [17.9689, 79.5941],
    subLocations: {
      'Central': ['Hanamkonda', 'Kazipet', 'Waddepally', 'Subedari'],
      'East': ['Hunter Road', 'Shayampet'],
      'West': ['NIT Warangal', 'Bhupalpally'],
    },
    metro: false,
    majorColleges: ['NIT Warangal'],
  },
]

// Helper functions
export const getAllCities = () => {
  return INDIAN_CITIES.map(city => ({
    name: city.name,
    state: city.state,
    metro: city.metro,
    majorColleges: city.majorColleges,
    subLocationCount: Object.keys(city.subLocations).length,
  }))
}

export const getCityWithSubLocations = (cityName) => {
  const city = INDIAN_CITIES.find(
    c => c.name.toLowerCase() === cityName.toLowerCase()
  )
  return city || null
}

export const getAllStates = () => {
  const states = [...new Set(INDIAN_CITIES.map(c => c.state))]
  return states.sort()
}

export const getCitiesByState = (stateName) => {
  return INDIAN_CITIES.filter(
    c => c.state.toLowerCase() === stateName.toLowerCase()
  ).map(city => ({
    name: city.name,
    metro: city.metro,
    subLocationCount: Object.keys(city.subLocations).length,
  }))
}

export const searchLocations = (query, limit = 20) => {
  const q = query.toLowerCase()
  const results = []

  INDIAN_CITIES.forEach(city => {
    // Match city name
    if (city.name.toLowerCase().includes(q)) {
      results.push({
        type: 'city',
        city: city.name,
        state: city.state,
        text: `${city.name}, ${city.state}`,
        coordinates: city.coordinates || null,
      })
    }

    // Match sub-locations
    Object.entries(city.subLocations).forEach(([category, locations]) => {
      locations.forEach(location => {
        if (location.toLowerCase().includes(q)) {
          results.push({
            type: 'subLocation',
            city: city.name,
            state: city.state,
            subLocation: location,
            category,
            text: `${location}, ${city.name}`,
            coordinates: city.coordinates || null,
          })
        }
      })
    })
  })

  return results.slice(0, limit)
}

export const getAllSubLocations = () => {
  const subLocations = []
  
  INDIAN_CITIES.forEach(city => {
    Object.entries(city.subLocations).forEach(([category, locations]) => {
      locations.forEach(location => {
        subLocations.push({
          name: location,
          city: city.name,
          state: city.state,
          category,
        })
      })
    })
  })

  return subLocations
}

export default INDIAN_CITIES