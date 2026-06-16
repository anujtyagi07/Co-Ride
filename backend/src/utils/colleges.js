// Indian Colleges/Universities with domains for student verification

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
  { name: 'University of Delhi', domain: 'du.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'Punjab University', domain: 'puchd.ac.in', city: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Anna University', domain: 'annauniv.edu', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'VIT Vellore', domain: 'vit.ac.in', city: 'Vellore', state: 'Tamil Nadu' },
  { name: 'SRM Institute', domain: 'srmist.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Manipal University', domain: 'manipal.edu', city: 'Manipal', state: 'Karnataka' },
  { name: 'Amrita Vishwa Vidyapeetham', domain: 'amrita.edu', city: 'Coimbatore', state: 'Tamil Nadu' },

  // State Universities
  { name: 'Maharashtra Institute of Technology', domain: 'mitwpu.edu.in', city: 'Pune', state: 'Maharashtra' },
  { name: 'College of Engineering Pune', domain: 'coe.snu.edu.in', city: 'Pune', state: 'Maharashtra' },
  { name: 'Thapar University', domain: 'thapar.edu', city: 'Patiala', state: 'Punjab' },
  { name: 'Birla Institute of Technology', domain: 'bitmesra.ac.in', city: 'Ranchi', state: 'Jharkhand' },
  { name: 'PSG College of Technology', domain: 'psgtech.ac.in', city: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'RV College of Engineering', domain: 'rvce.edu.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'BMS College of Engineering', domain: 'bmsce.ac.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'VJTI Mumbai', domain: 'vjti.ac.in', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'ICT Mumbai', domain: 'ictmumbai.edu.in', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'NITTE', domain: 'nitte.edu.in', city: 'Mangalore', state: 'Karnataka' },
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

  // More Top Colleges
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

  // More NITs
  { name: 'NIT Silchar', domain: 'nits.ac.in', city: 'Silchar', state: 'Assam' },
  { name: 'NIT Srinagar', domain: 'nitsri.ac.in', city: 'Srinagar', state: 'Jammu & Kashmir' },
  { name: 'NIT Patna', domain: 'nitp.ac.in', city: 'Patna', state: 'Bihar' },
  { name: 'NIT Bhopal', domain: 'nitb.ac.in', city: 'Bhopal', state: 'Madhya Pradesh' },
  { name: 'NIT Jaipur', domain: 'mnit.ac.in', city: 'Jaipur', state: 'Rajasthan' },

  // IIITs
  { name: 'IIIT Allahabad', domain: 'iiita.ac.in', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { name: 'IIIT Gwalior', domain: 'iiitm.ac.in', city: 'Gwalior', state: 'Madhya Pradesh' },
  { name: 'IIIT Jabalpur', domain: 'iiitdmj.ac.in', city: 'Jabalpur', state: 'Madhya Pradesh' },
  { name: 'IIIT Kancheepuram', domain: 'iiitdm.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'IIIT Kottayam', domain: 'iiitkottayam.ac.in', city: 'Kottayam', state: 'Kerala' },
  { name: 'IIIT Kurnool', domain: 'iiitk.ac.in', city: 'Kurnool', state: 'Andhra Pradesh' },
  { name: 'IIIT Lucknow', domain: 'iiitl.ac.in', city: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'IIIT Nagpur', domain: 'iiitn.ac.in', city: 'Nagpur', state: 'Maharashtra' },
  { name: 'IIIT Pune', domain: 'iiitp.ac.in', city: 'Pune', state: 'Maharashtra' },
  { name: 'IIIT Ranchi', domain: 'iiitranchi.ac.in', city: 'Ranchi', state: 'Jharkhand' },
  { name: 'IIIT Surat', domain: 'iiitsurat.ac.in', city: 'Surat', state: 'Gujarat' },
  { name: 'IIIT Una', domain: 'iiitu.ac.in', city: 'Una', state: 'Himachal Pradesh' },
  { name: 'IIIT Vadodara', domain: 'iiitv.ac.in', city: 'Vadodara', state: 'Gujarat' },
  { name: 'IIIT Bhagalpur', domain: 'iiitbh.ac.in', city: 'Bhagalpur', state: 'Bihar' },

  // More IIMs
  { name: 'IIM Lucknow', domain: 'iiml.ac.in', city: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'IIM Indore', domain: 'iimidr.ac.in', city: 'Indore', state: 'Madhya Pradesh' },
  { name: 'IIM Shillong', domain: 'iimshillong.ac.in', city: 'Shillong', state: 'Meghalaya' },
  { name: 'IIM Ranchi', domain: 'iimranchi.ac.in', city: 'Ranchi', state: 'Jharkhand' },
  { name: 'IIM Raipur', domain: 'iimraipur.ac.in', city: 'Raipur', state: 'Chhattisgarh' },
  { name: 'IIM Trichy', domain: 'iimtrichy.ac.in', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'IIM Udaipur', domain: 'iimu.ac.in', city: 'Udaipur', state: 'Rajasthan' },
  { name: 'IIM Nagpur', domain: 'iimnagpur.ac.in', city: 'Nagpur', state: 'Maharashtra' },
  { name: 'IIM Visakhapatnam', domain: 'iimv.ac.in', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { name: 'IIM Amritsar', domain: 'iimamritsar.ac.in', city: 'Amritsar', state: 'Punjab' },
  { name: 'IIM Bodh Gaya', domain: 'iimbodhgaya.ac.in', city: 'Bodh Gaya', state: 'Bihar' },
  { name: 'IIM Sambalpur', domain: 'iimsambalpur.ac.in', city: 'Sambalpur', state: 'Odisha' },
  { name: 'IIM Sirmaur', domain: 'iimsirmaur.ac.in', city: 'Sirmaur', state: 'Himachal Pradesh' },
  { name: 'IIM Jammu', domain: 'iimj.ac.in', city: 'Jammu', state: 'Jammu & Kashmir' },

  // More AIIMS
  { name: 'AIIMS Patna', domain: 'aiimspatna.org', city: 'Patna', state: 'Bihar' },
  { name: 'AIIMS Raipur', domain: 'aiimsraipur.edu.in', city: 'Raipur', state: 'Chhattisgarh' },
  { name: 'AIIMS Nagpur', domain: 'aiimsnagpur.edu.in', city: 'Nagpur', state: 'Maharashtra' },
  { name: 'AIIMS Mangalagiri', domain: 'aiimsmangalagiri.edu.in', city: 'Mangalagiri', state: 'Andhra Pradesh' },
  { name: 'AIIMS Kalyani', domain: 'aiimskalyani.edu.in', city: 'Kalyani', state: 'West Bengal' },
  { name: 'AIIMS Gorakhpur', domain: 'aiimsgorakhpur.edu.in', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { name: 'AIIMS Deoghar', domain: 'aiimsdeoghar.edu.in', city: 'Deoghar', state: 'Jharkhand' },

  // Top Private Engineering Colleges
  { name: 'BITS Goa', domain: 'bits-goa.ac.in', city: 'Goa', state: 'Goa' },
  { name: 'BITS Hyderabad', domain: 'bits-hyderabad.ac.in', city: 'Hyderabad', state: 'Telangana' },
  { name: 'VIT Chennai', domain: 'vitcc.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'VIT AP', domain: 'vitap.ac.in', city: 'Amaravati', state: 'Andhra Pradesh' },
  { name: 'SRM AP', domain: 'srmap.edu.in', city: 'Amaravati', state: 'Andhra Pradesh' },
  { name: 'Thapar Institute', domain: 'thapar.edu', city: 'Patiala', state: 'Punjab' },
  { name: 'DTU Delhi', domain: 'dtu.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'NSUT Delhi', domain: 'nsut.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'IGDTUW Delhi', domain: 'igdtuw.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'DAIICT Gandhinagar', domain: 'daiict.ac.in', city: 'Gandhinagar', state: 'Gujarat' },
  { name: 'PDPU Gandhinagar', domain: 'pdpu.ac.in', city: 'Gandhinagar', state: 'Gujarat' },
  { name: 'Nirma University', domain: 'nirmauni.ac.in', city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'LNMIIT Jaipur', domain: 'lnmiit.ac.in', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'JK Lakshmipat University', domain: 'jku.ac.in', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'PES University', domain: 'pes.edu', city: 'Bangalore', state: 'Karnataka' },
  { name: 'Dayananda Sagar College', domain: 'dsce.edu.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'MS Ramaiah Institute', domain: 'msrit.edu', city: 'Bangalore', state: 'Karnataka' },
  { name: 'Bangalore Institute of Technology', domain: 'bit-bangalore.edu.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'KLS Gogte Institute', domain: 'git.edu', city: 'Belgaum', state: 'Karnataka' },
  { name: 'SSN College of Engineering', domain: 'ssn.edu.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'SASTRA University', domain: 'sastra.ac.in', city: 'Thanjavur', state: 'Tamil Nadu' },
  { name: 'Kongu Engineering College', domain: 'kongu.ac.in', city: 'Erode', state: 'Tamil Nadu' },
  { name: 'KPR Institute', domain: 'kpriet.ac.in', city: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'IETE Delhi', domain: 'iete.org', city: 'Delhi', state: 'Delhi' },

  // Central & State Universities
  { name: 'Panjab University', domain: 'puchd.ac.in', city: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Guru Nanak Dev University', domain: 'gndu.ac.in', city: 'Amritsar', state: 'Punjab' },
  { name: 'Punjabi University Patiala', domain: 'punjabiuniversity.ac.in', city: 'Patiala', state: 'Punjab' },
  { name: 'Kurukshetra University', domain: 'kuk.ac.in', city: 'Kurukshetra', state: 'Haryana' },
  { name: 'Maharshi Dayanand University', domain: 'mdu.ac.in', city: 'Rohtak', state: 'Haryana' },
  { name: 'Guru Jambheshwar University', domain: 'gjust.ac.in', city: 'Hisar', state: 'Haryana' },
  { name: 'Rajasthan University', domain: 'uniraj.ac.in', city: 'Jaipur', state: 'Rajasthan' },
  { name: 'Jodhpur National University', domain: 'jnvu.edu.in', city: 'Jodhpur', state: 'Rajasthan' },
  { name: 'Kota University', domain: 'uok.ac.in', city: 'Kota', state: 'Rajasthan' },
  { name: 'Barkatullah University', domain: 'bubhopal.ac.in', city: 'Bhopal', state: 'Madhya Pradesh' },
  { name: 'Devi Ahilya University', domain: 'dauniv.ac.in', city: 'Indore', state: 'Madhya Pradesh' },
  { name: 'Jabalpur Engineering College', domain: 'jec-jabalpur.ac.in', city: 'Jabalpur', state: 'Madhya Pradesh' },
  { name: 'Lucknow University', domain: 'lkouniv.ac.in', city: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'AKTU Lucknow', domain: 'aktu.ac.in', city: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'HBTU Kanpur', domain: 'hbtu.ac.in', city: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'MMMUT Gorakhpur', domain: 'mmmut.ac.in', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { name: 'Calcutta University', domain: 'caluniv.ac.in', city: 'Kolkata', state: 'West Bengal' },
  { name: 'IIEST Shibpur', domain: 'iiests.ac.in', city: 'Howrah', state: 'West Bengal' },
  { name: 'Kalyani Government Engineering College', domain: 'kgec.edu.in', city: 'Kalyani', state: 'West Bengal' },
  { name: 'Utkal University', domain: 'utkaluniversity.ac.in', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'CET Bhubaneswar', domain: 'cet.edu.in', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'VSSUT Burla', domain: 'vssut.ac.in', city: 'Burla', state: 'Odisha' },
  { name: 'Patna University', domain: 'patnauniversity.ac.in', city: 'Patna', state: 'Bihar' },
  { name: 'Gauhati University', domain: 'gauhati.ac.in', city: 'Guwahati', state: 'Assam' },
  { name: 'Tezpur University', domain: 'tezu.ernet.in', city: 'Tezpur', state: 'Assam' },
  { name: 'NEHU Shillong', domain: 'nehu.ac.in', city: 'Shillong', state: 'Meghalaya' },

  // Law Schools
  { name: 'NLSIU Bangalore', domain: 'nlslaw.ac.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'NALSAR Hyderabad', domain: 'nalsar.ac.in', city: 'Hyderabad', state: 'Telangana' },
  { name: 'NLU Delhi', domain: 'nludelhi.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'NLU Kolkata', domain: 'nujs.edu', city: 'Kolkata', state: 'West Bengal' },
  { name: 'NLU Jodhpur', domain: 'nlujodhpur.ac.in', city: 'Jodhpur', state: 'Rajasthan' },
  { name: 'GNLU Gandhinagar', domain: 'gnlu.ac.in', city: 'Gandhinagar', state: 'Gujarat' },
  { name: 'RMLNLU Lucknow', domain: 'rmlnlu.ac.in', city: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Symbiosis Law School', domain: 'symlaw.ac.in', city: 'Pune', state: 'Maharashtra' },

  // Design & Architecture
  { name: 'NID Ahmedabad', domain: 'nid.edu', city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'NIT Rourkela Design', domain: 'nitrkl.ac.in', city: 'Rourkela', state: 'Odisha' },
  { name: 'SPA Delhi', domain: 'spa.ac.in', city: 'Delhi', state: 'Delhi' },
  { name: 'CEPT University', domain: 'cept.ac.in', city: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Srishti Institute', domain: 'srishti.ac.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'MIT Institute of Design', domain: 'mitid.edu.in', city: 'Pune', state: 'Maharashtra' },

  // Medical Colleges
  { name: 'CMC Vellore', domain: 'cmcvellore.ac.in', city: 'Vellore', state: 'Tamil Nadu' },
  { name: 'KGMU Lucknow', domain: 'kgmu.org', city: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Grant Medical College', domain: 'grantmedicalcollege-jjhospital.org', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Seth GS Medical College', domain: 'kembuddy.com', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'Bangalore Medical College', domain: 'bmc.edu.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'Madras Medical College', domain: 'mmc.ac.in', city: 'Chennai', state: 'Tamil Nadu' },
  { name: 'IPGMER Kolkata', domain: 'ipgmer.gov.in', city: 'Kolkata', state: 'West Bengal' },

  // Pharmacy & Other
  { name: 'NIPER Mohali', domain: 'niper.ac.in', city: 'Mohali', state: 'Punjab' },
  { name: 'NIPER Hyderabad', domain: 'niperhyd.ac.in', city: 'Hyderabad', state: 'Telangana' },
  { name: 'ICT Mumbai', domain: 'ictmumbai.edu.in', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'IISc Bangalore', domain: 'iisc.ac.in', city: 'Bangalore', state: 'Karnataka' },
  { name: 'TIFR Mumbai', domain: 'tifr.res.in', city: 'Mumbai', state: 'Maharashtra' },
  { name: 'ISI Kolkata', domain: 'isical.ac.in', city: 'Kolkata', state: 'West Bengal' },
  { name: 'CMI Chennai', domain: 'cmi.ac.in', city: 'Chennai', state: 'Tamil Nadu' },

  // More Engineering Colleges
  { name: 'Chitkara University', domain: 'chitkara.edu.in', city: 'Chandigarh', state: 'Chandigarh' },
  { name: 'Lovely Professional University', domain: 'lpu.co.in', city: 'Phagwara', state: 'Punjab' },
  { name: 'Chandigarh University', domain: 'cuchd.in', city: 'Mohali', state: 'Punjab' },
  { name: 'Amity University Noida', domain: 'amity.edu', city: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Galgotias University', domain: 'galgotiasuniversity.edu.in', city: 'Greater Noida', state: 'Uttar Pradesh' },
  { name: 'Sharda University', domain: 'sharda.ac.in', city: 'Greater Noida', state: 'Uttar Pradesh' },
  { name: 'BML Munjal University', domain: 'bmu.edu.in', city: 'Gurugram', state: 'Haryana' },
  { name: 'IILM Gurugram', domain: 'iilm.ac.in', city: 'Gurugram', state: 'Haryana' },
  { name: 'UPES Dehradun', domain: 'upes.ac.in', city: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Graphic Era University', domain: 'geu.ac.in', city: 'Dehradun', state: 'Uttarakhand' },
  { name: 'DIT University', domain: 'dituniversity.edu.in', city: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Sikkim Manipal University', domain: 'smu.edu.in', city: 'Gangtok', state: 'Sikkim' },
  { name: 'SASTRA Deemed University', domain: 'sastra.edu', city: 'Thanjavur', state: 'Tamil Nadu' },
  { name: 'KL University', domain: 'kluniversity.in', city: 'Guntur', state: 'Andhra Pradesh' },
  { name: 'GITAM University', domain: 'gitam.edu', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { name: 'CV Raman University', domain: 'cvr.ac.in', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'SOA University', domain: 'soa.ac.in', city: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Silicon Institute', domain: 'silicon.ac.in', city: 'Bhubaneswar', state: 'Odisha' },
]

// Function to verify college email
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

// Get all colleges
export const getAllColleges = () => {
  return COLLEGES.map(c => ({
    name: c.name,
    domain: c.domain,
    city: c.city,
    state: c.state,
  }))
}

// Get college by domain
export const getCollegeByDomain = (domain) => {
  return COLLEGES.find(c => c.domain.toLowerCase() === domain.toLowerCase())
}

// Get colleges by state
export const getCollegesByState = (state) => {
  return COLLEGES.filter(c => c.state.toLowerCase() === state.toLowerCase())
}

// Get colleges by city
export const getCollegesByCity = (city) => {
  return COLLEGES.filter(c => c.city.toLowerCase() === city.toLowerCase())
}

// Search colleges by name
export const searchColleges = (query) => {
  const q = query.toLowerCase()
  return COLLEGES.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q) ||
    c.state.toLowerCase().includes(q)
  )
}