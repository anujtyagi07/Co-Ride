// Indian Colleges/Universities for student verification
// Used in frontend for dropdown selection and email domain verification

export const COLLEGES = [
  // IITs
  { name: 'IIT Bombay', domain: 'iitb.ac.in', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'IIT Delhi', domain: 'iitd.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'IIT Madras', domain: 'iitm.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'IIT Kanpur', domain: 'iitk.ac.in', city: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'IIT Kharagpur', domain: 'iitkgp.ac.in', city: 'Kharagpur', state: 'West Bengal' },
  { name: 'IIT Roorkee', domain: 'iitr.ac.in', city: 'Roorkee', state: 'Uttarakhand' },
  { name: 'IIT Guwahati', domain: 'iitg.ac.in', city: 'Guwahati', state: 'Assam' },
  { name: 'IIT Hyderabad', domain: 'iith.ac.in', city: 'Hyderabad', state: 'Telangana' },
  { name: 'IIT Gandhinagar', domain: 'iitgn.ac.in', city: 'Gandhinagar', state: 'Gujarat' },
  { name: 'IIT Ropar', domain: 'iitrpr.ac.in', city: 'Ropar', state: 'Punjab' },
  { name: 'IIT Bhubaneswar', domain: 'iitbbs.ac.in', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'IIT Indore', domain: 'iiti.ac.in', city: 'Indore', state: 'Madhya Pradesh' },
  { name: 'IIT Mandi', domain: 'iitmandi.ac.in', city: 'Mandi', state: 'Himachal Pradesh' },
  { name: 'IIT Patna', domain: 'iitp.ac.in', city: 'Patna', state: 'Bihar' },
  { name: 'IIT Goa', domain: 'iitgoa.ac.in', city: 'Goa', state: 'Goa' },
  { name: 'IIT Jodhpur', domain: 'iitj.ac.in', city: 'Jodhpur', state: 'Rajasthan' },
  { name: 'IIT Tirupati', domain: 'iittp.ac.in', city: 'Tirupati', state: 'Andhra Pradesh' },
  { name: 'IIT Dharwad', domain: 'iitdh.ac.in', city: 'Dharwad', state: 'Karnataka' },
  { name: 'IIT Bhilai', domain: 'iitbhilai.ac.in', city: 'Bhilai', state: 'Chhattisgarh' },
  { name: 'IIT Jammu', domain: 'iitjammu.ac.in', city: 'Jammu', state: 'Jammu & Kashmir' },

  // NITs
  { name: 'NIT Trichy', domain: 'nittrichy.ac.in', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'NIT Surathkal', domain: 'nitk.edu.in', city: 'Mangalore', state: 'Karnataka' },
  { name: 'NIT Warangal', domain: 'nitw.ac.in', city: 'Warangal', state: 'Telangana' },
  { name: 'NIT Calicut', domain: 'nitc.ac.in', city: 'Kozhikode', state: 'Kerala' },
  { name: 'NIT Rourkela', domain: 'nitrkl.ac.in', city: 'Rourkela', state: 'Odisha' },
  { name: 'NIT Kurukshetra', domain: 'nitkkr.ac.in', city: 'Kurukshetra', state: 'Haryana' },
  { name: 'NIT Hamirpur', domain: 'nith.ac.in', city: 'Hamirpur', state: 'Himachal Pradesh' },
  { name: 'NIT Durgapur', domain: 'nitdgp.ac.in', city: 'Durgapur', state: 'West Bengal' },
  { name: 'NIT Jamshedpur', domain: 'nitjsr.ac.in', city: 'Jamshedpur', state: 'Jharkhand' },
  { name: 'NIT Raipur', domain: 'nitrr.ac.in', city: 'Raipur', state: 'Chhattisgarh' },
  { name: 'NIT Andhra Pradesh', domain: 'nitandhra.ac.in', city: 'Tirupati', state: 'Andhra Pradesh' },
  { name: 'NIT Sikkim', domain: 'nitsikkim.ac.in', city: 'Ravangla', state: 'Sikkim' },
  { name: 'NIT Uttarakhand', domain: 'nituk.ac.in', city: 'Srinagar', state: 'Uttarakhand' },
  { name: 'NIT Goa', domain: 'nitgoa.ac.in', city: 'Bonda', state: 'Goa' },

  // AIIMS
  { name: 'AIIMS Delhi', domain: 'aiims.edu', city: 'Delhi', state: 'Delhi' },
  { name: 'AIIMS Jodhpur', domain: 'aiimsjodhpur.edu.in', city: 'Jodhpur', state: 'Rajasthan' },
  { name: 'AIIMS Bhubaneswar', domain: 'aiimsbhubaneswar.edu.in', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'AIIMS Rishikesh', domain: 'aiimsrishikesh.edu.in', city: 'Rishikesh', state: 'Uttarakhand' },
  { name: 'AIIMS Bhopal', domain: 'aiimsbhopal.edu.in', city: 'Bhopal', state: 'Madhya Pradesh' },

  // Central Universities
  { name: 'Delhi University', domain: 'du.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'JNU Delhi', domain: 'jnu.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'BHU Varanasi', domain: 'bhu.ac.in', city: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Aligarh Muslim University', domain: 'amu.ac.in', city: 'Aligarh', state: 'Uttar Pradesh' },
  { name: 'Jadavpur University', domain: 'jadavpur.ac.in', city: 'Kolkata', state: 'West Bengal' },
  { name: 'University of Hyderabad', domain: 'uohyd.ac.in', city: 'Hyderabad', state: 'Telangana' },
  { name: 'Punjab University', domain: 'puchd.ac.in', city: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Anna University', domain: 'annauniv.edu', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'VIT Vellore', domain: 'vit.ac.in', city: 'Vellore', state: 'Tamil Nadu' },
  { name: 'SRM Institute', domain: 'srmist.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Manipal University', domain: 'manipal.edu', city: 'Manipal', state: 'Karnataka' },
  { name: 'Amrita Vishwa Vidyapeetham', domain: 'amrita.edu', city: 'Coimbatore', state: 'Tamil Nadu' },

  // State Universities
  { name: 'Maharashtra Institute of Technology', domain: 'mitwpu.edu.in', city: 'Pune', state: 'Maharashtra' },
  { name: 'Thapar University', domain: 'thapar.edu', city: 'Patiala', state: 'Punjab' },
  { name: 'Birla Institute of Technology', domain: 'bitmesra.ac.in', city: 'Ranchi', state: 'Jharkhand' },
  { name: 'PSG College of Technology', domain: 'psgtech.ac.in', city: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'RV College of Engineering', domain: 'rvce.edu.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'BMS College of Engineering', domain: 'bmsce.ac.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'VJTI Mumbai', domain: 'vjti.ac.in', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'ICT Mumbai', domain: 'ictmumbai.edu.in', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Christ University', domain: 'christuniversity.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'Symbiosis International', domain: 'sibm.edu.in', city: 'Pune', state: 'Maharashtra' },

  // Private Universities
  { name: 'IIIT Hyderabad', domain: 'iiit.ac.in', city: 'Hyderabad', state: 'Telangana' },
  { name: 'IIIT Bangalore', domain: 'iiitb.ac.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'IIIT Delhi', domain: 'iiitd.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'BITS Pilani', domain: 'bits-pilani.ac.in', city: 'Pilani', state: 'Rajasthan' },
  { name: 'IIM Ahmedabad', domain: 'iima.ac.in', city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'IIM Bangalore', domain: 'iimb.ac.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'IIM Calcutta', domain: 'iimcal.ac.in', city: 'Kolkata', state: 'West Bengal' },
  { name: 'IIM Kozhikode', domain: 'iimk.ac.in', city: 'Kozhikode', state: 'Kerala' },
  { name: 'ISB Hyderabad', domain: 'isbschool.ac.in', city: 'Hyderabad', state: 'Telangana' },
  { name: 'IIT (ISM) Dhanbad', domain: 'iitism.ac.in', city: 'Dhanbad', state: 'Jharkhand' },

  // More NITs
  { name: 'NIT Puducherry', domain: 'nitpy.ac.in', city: 'Puducherry', state: 'Puducherry' },
  { name: 'MNNIT Allahabad', domain: 'mnnit.ac.in', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { name: 'MNIT Jaipur', domain: 'mnit.ac.in', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'SVNIT Surat', domain: 'svnit.ac.in', city: 'Surat', state: 'Gujarat' },
  { name: 'NIT Meghalaya', domain: 'nitm.ac.in', city: 'Shillong', state: 'Meghalaya' },
  { name: 'NIT Arunachal Pradesh', domain: 'nitarap.ac.in', city: 'Yupia', state: 'Arunachal Pradesh' },
  { name: 'NIT Mizoram', domain: 'nitmz.ac.in', city: 'Aizawl', state: 'Mizoram' },
  { name: 'NIT Nagaland', domain: 'nitnagaland.ac.in', city: 'Dimapur', state: 'Nagaland' },
  { name: 'NIT Manipur', domain: 'nitmanipur.ac.in', city: 'Imphal', state: 'Manipur' },
  { name: 'NIT Agartala', domain: 'nita.ac.in', city: 'Agartala', state: 'Tripura' },
]

// Verify college email domain
export const verifyCollegeEmail = (email) => {
  if (!email) return { valid: false, college: null }
  
  const emailDomain = email.split('@')[1]?.toLowerCase()
  if (!emailDomain) return { valid: false, college: null }
  
  const college = COLLEGES.find(c => c.domain.toLowerCase() === emailDomain)
  
  if (college) {
    return {
      valid: true,
      college: {
        name: college.name,
        domain: college.domain,
        city: college.city,
        state: college.state,
      },
    }
  }
  
  return { valid: false, college: null }
}

// Get college domains as array
export const COLLEGE_DOMAINS = COLLEGES.map(c => c.domain)

// Indian cities for autocomplete
export const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Allahabad',
  'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
  'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Mysore', 'Tiruchirappalli',
  'Bhubaneswar', 'Salem', 'Kolkata', 'Bareilly', 'Aligarh', 'Hisar', 'Rohtak', 'Jalandhar',
]

export default COLLEGES