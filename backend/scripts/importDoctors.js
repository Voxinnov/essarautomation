require('dotenv').config();
const sequelize = require('../config/database');
const { Doctor } = require('../models');

const doctorsList = [
    { name: "Jimmy Mathew", address: "404, NATIONAL EXCELLENCY, KALAVATH ROAD, Palarivattam", phone: "9446545001" },
    { name: "Aniraj R", address: "Professor, Dept of Plastic Surgery, Govt Medical College, Thiruvananthapuram", phone: "9447304576" },
    { name: "PRINCE HP", address: "DEPT OF PLASTIC SURGERY, ELITE MISSION HOSPITAL,KOORKENCHERY ,THRISSUR", phone: "9656091375" },
    { name: "Dr Ajai kumar kamath", address: "Akarshan, green acres , parolickal ettumanoor", phone: "9447302078" },
    { name: "Dr Kunhambu Nambiar", address: "Lakshmi,13/834A, chemmattamvayal, BALLA POST, KANHANGAD , Kasaragod671532", phone: "9447088931" },
    { name: "Dr.DURGA M.L.S", address: "Amritha medical college i,ponnekara, kochi", phone: "9966998890" },
    { name: "DR JOSE THARAYIL", address: ".,MUTTATHIL LANE, KADAVANVTHARA, KOCHI 682020", phone: "9946444391" },
    { name: "Pradeep Kumar", address: "A 1141 , sobha topaz , sobha city , thrissur , kerala. 680553", phone: "09845470297" },
    { name: "Priyavrata Rajasubramanian", address: "Department of Plastic Surgery, Government Medical College, Kozhikode", phone: "7760008166" },
    { name: "Dr. VINU ROY", address: "Villa no:41,Haritha homes,Vadookkara,Thrissur", phone: "9447780729" },
    { name: "DR P KISHORE", address: "Amritahyanam, 31/514, AKG ROAD, EDAPPALLY PO, Pin 682024, Ernakulam", phone: "9349254003" },
    { name: "CHARLES JUDE ANTO", address: "Thettayil house, Konni P.O., Pathanamthitta district. Pin - 689691", phone: "9446340304" },
    { name: "Dr Cyril Joseph", address: "The Dream , Kudakasseril House, Kattode, Manjadi. PO, Thiruvalla, Kerala-689105", phone: "9495329520" },
    { name: "NANDAKUMAR. U. R", address: "TC 26/1731, \"Lakshmi\", Vadayakkad Jn., Vanchiyoor P. O, Trivandrum - 695035", phone: "9447131454" },
    { name: "Patrick Paul", address: "Room 19, Doctors Quarters, Travancore Medicity, Kollam.", phone: "9526100384" },
    { name: "LINTO T. MATHEW", address: "SENIOR RESIDENT, DEPARTMENT OF PLASTIC AND RECONSTRUCTIVE SURGERY, GOVT.", phone: "9497392255" },
    { name: "Paul Joyce", address: "Payyapilly house, Eden 10, Kavaraparambu, Nayathode PO, Angamaly, Kerala.", phone: "7507296474" },
    { name: "Sri Valli Vemulapalli", address: "Dept of plastic surgery, Amrita institute of medical science, edappally, kochi", phone: "9876074894" },
    { name: "Greshma T R", address: "W/o Jose paul.43-F,STP pipeline road,elamkulam,682020", phone: "9074922823" },
    { name: "Sannia Salim", address: "Valanjambalam pallimukku kochi", phone: "9495761029" },
    { name: "DR AJAI K S", address: "DEPT OF PLASTIC SURGERY ,KOORKENCHERY,ELITE MISSION HOSPITAL", phone: "9915817073" },
    { name: "RANITHA RAVINDRAN", address: "\"Lakshmi Smrithi\", Minalur P.O, Mulakunnathukavu Via, Thrissur 680581", phone: "9496347070" },
    { name: "Alexander G", address: "EMC Hospital, kochi, kerala , India", phone: "9847139470" },
    { name: "Anoop S.", address: "Department of Plastic Surgery, MOSC Medical College, Kolenchery, Ernakulam. 682311", phone: "9496815905" },
    { name: "ATHIRA C", address: "Senior resident, department of plastic and reconstructive surgery, GMC, TVM", phone: "9388848555" },
    { name: "Akshaya M", address: "Senior Resident, Government Medical College, Kozhikode", phone: "9562477907" },
    { name: "AMAL T S", address: "SAAJ BHAVAN, PATTANAKKAD P O, CHERTHALA, ALAPPUZHA, 688531", phone: "9567667762" },
    { name: "AKSHAI GEORGE PAUL", address: "3rd year Plastic surgery ResidentDepartment of Plastic SurgeryAster MIMS Calicut", phone: "9605747584" },
    { name: "Steve Reji Thomas", address: "Amayil house, Nannuvacadu, Pathanamthitta, Kerala, 689645", phone: "9995071060" },
    { name: "Shubha Lakshmi Kadukk", address: "Amrita hospital, ponnekara road Edappally, Ernakulam kochi, Kerala.", phone: "8309673838" },
    { name: "Sheyon Yohannan", address: "Kolangara MansionNear Christ College Junction, Thrissur Shornur Road, Irinjalakuda, Thrissur", phone: "+917876369980" },
    { name: "Thomas Punnoose", address: "Pulimoottil House, Kunnamthanam P.O, Pathanamthitta Dt, 689581", phone: "9495682845" },
    { name: "JAGADEESH SREENIVA", address: "Indeevaram, Near Nelliekodu housing colony, Kavu bus stop,Chevayour P OCalicut. Pin 673017", phone: "+919895342522" },
    { name: "Nidhi Miriam Eapen", address: "Kochuveettil Bethel, Kozhencherry East (PO), Pathanamthitta -689641", phone: "8289982700" },
    { name: "DR DRISHYA DEVASIA", address: "ALRA 11B, Ashramam Lane, Azad Road, Kaloor, Kochi 682017", phone: "7012888654" },
    { name: "DEEPAK ARAVIND", address: "Dhwani,Behind Orchid Cafe,BETHELPADI,KUTTAPUZHA P O,THIRUVALLA, PATHANAMTHIT", phone: "9447453525" },
    { name: "Sreelal Sreedharan", address: "TC3/502(10),sandhram, GSN77,Gandhismaraka nagar,muttada.p.o,Trivandrum 695025", phone: "9846266067" },
    { name: "Dr. Sharika Chandran", address: "ARA 117, Athani Lane, Vanchiyur, Trivandrum", phone: "8884407632" },
    { name: "AARATHI ANTHARJAN", address: "SENIOR CONSULTANT PLASTIC SURGERYBABY MEMORIAL HOSPITAL KANNUR", phone: "9746652958" },
    { name: "THUSHARA K R", address: "T C- 43/510(2), Ariyan kuzhi, Manacaud. P.O, Trivandrum,  695009, Kerala", phone: "9895513445" },
    { name: "Subramania Iyer", address: "Tower 2 17c tritvam apartment marine drive extension kochi 682018", phone: "9447108842" },
    { name: "Lekshmi M", address: "Prof &HOD, Dept of Plastic Surgery, GMC Kottayam", phone: "9446065454" },
    { name: "Jyoshid R Balan", address: "Villa 18, Elite Meadows, Amalanagar", phone: "8113005557" },
    { name: "Sharun Abey Kurian", address: "Dept of Plastic Surgery, GMC Kottayam", phone: "8075433603" },
    { name: "Aswathy Chandran", address: "Flat number 7F, Skyline grace apartment, Cathedral church road,Pala, Kottayam", phone: "7022604724" },
    { name: "Dr.Faiyaz Abdul Jabbar", address: "Flat:8B,  KMP Swapnapuri, Chembukkavu, Thrissur - 680020", phone: "8904535223" },
    { name: "R. Jayakumar", address: "Specialists hospital, Kochi", phone: "9446077148" },
    { name: "Deepak Shanbhag", address: "4A Si Coral crest, SRM road, Ernakulum north", phone: "9008416686" },
    { name: "ABHIJITH ANTONY", address: "Flat No 5103, Tower 5, Prestige Hillside Gateway, Infopark Road Kakkanad , Kalappurakkal,", phone: "8089807859" },
    { name: "Sarath TS", address: "Flat no 3E ArtechPalmgrove , Polayathodu,Kollam", phone: "9447122369" },
    { name: "DIVYA SYAM", address: "3C, DD WEST WINDS, LISIE HOSPITAL ROAD, KACHERIPADY, KOCHI", phone: "8971045643" },
    { name: "Joyal Jose", address: "Eluvathingal, Anakkal, Kanjirapally, Kottayam", phone: "9400355717" },
    { name: "Aneesh Joseph", address: "Punnolikunnel house, Thankamany P O, idukki 685584", phone: "9496336445" },
    { name: "Renji Issac james", address: "Puliyunnil house, kanjar p o", phone: "7034884629" },
    { name: "Sankar Das", address: "Shivashakthi (Karottu), GP Road,Near mariyamman Kovil", phone: "08547884761" },
    { name: "Dr Hemang Arvindkuma", address: "6c mulberry mystic rose St Christopher lane Kizhakkumpattukara near nirmalamata school thris", phone: "9833654291" },
    { name: "Pradeoth Mukundan Ko", address: "Villa no.2, Confident aries, Vilvattom, Kuriachira  P.O. Thrissur, Kerala 680006", phone: "9048935409" },
    { name: "Dr Sheeja Rajan TM", address: "Shrirang, Chevayur, Kozhikode", phone: "9747001136" },
    { name: "Dr.S.Zuveriya Zasreen", address: "Flat no 402 Prasanna Vihar Army flat AWHO ,Marine drive,Kochi ,Kerala 682018", phone: "6304145853" },
    { name: "Dr. Navien Issac John", address: "Dept.of plastic surgery, Jubilee Mission Medical College, Thrissur", phone: "8872375699" },
    { name: "MANOJ KUSHRA R", address: "Srishti TRRA 135C Chalkavattom Vennala PO. Ernakulam 682028", phone: "9447289106" },
    { name: "P K MOHANAN", address: "Dept.of Surgery, Amala Medical College, Thrissur", phone: "9847035840" },
    { name: "Sreelesh Sreedhar", address: "Thaara House, Nanminda P O, Kozhikode 673613", phone: "+919745005017" },
    { name: "Dr Bhaskara k g", address: "Medical trust Hospital kochi", phone: "09895545828" },
    { name: "Shaji Mathew", address: "Plot-17, Yasoram Garden phase-1, Ollur P. O, Thrissur, PIN 680306", phone: "9847450785" },
    { name: "M.V.Raman", address: "Maheswari, 134 - Westhill,Thrissur PIN 680006", phone: "9847306650" },
    { name: "DEEPAK B", address: "Almas hospital, Kottakal", phone: "9446467898" },
    { name: "Jayakrishnan kolady", address: "Amala HospitalTrissur", phone: "9847875758" },
    { name: "Dinkar Sreekumar", address: "Flat No. 7G, 7th Floor, Soubhagya Apartments,Indira Gandhi Road,Puthiyara PO, Kozhikode", phone: "7259360930" },
    { name: "Akhila Mohan", address: "Travancore meridian,kannammoola P.O,Trivandrum", phone: "9656397983" },
    { name: "Sabu C.P.", address: "SARAL NLRA 6 Neerazhi lane Ulloor Medical College P O Trivandrum", phone: "9446428094" },
    { name: "John Oommen", address: "30, Kanniya nagar TVS nagar road Koundampalayam, Coimbatore 641030", phone: "9947334427" },
    { name: "James Roy Kanjoor", address: "No 20 MTP road Coimbatore 641043", phone: "9994430707" },
    { name: "Helen Mary Titus", address: "Kalathiparambil house,palliport po ,ernakulam", phone: "8075046713" },
    { name: "Gigv Raj Kulangara", address: "Rajagiri Hospital, Aluva", phone: "8921398507" },
    { name: "Dr Abraham G Thomas", address: "Gracefield, Thamarassery 673573", phone: "+918054800989" },
    { name: "BINOD PRABHAKARAN", address: "TC 4/883 MOKKATIL KOWDIAR TRIVANDRUM", phone: "9446504396" },
    { name: "Praveen A J", address: "11b, Asset silverstreak apartments, Keezhmad, KUTTAMASSERY, Ernakulam, 683105", phone: "08284807604" },
    { name: "Sanju Samuel", address: "Edapally,kochi", phone: "8056190899" },
    { name: "Asish George Daniel", address: "Shelumiel, SRA-22, Sreemoolam road, Kumarapuram, Medical College PO, Thiruvananthapura", phone: "9446358887" },
    { name: "Philip Philip Puthumana", address: "Puthumana, I.T.I junction, Chengannur P.O,PIN 689121", phone: "9847054883" },
    { name: "Dr Suneesh P J", address: "Pulikottil House, Harmony lane, Laloor road, Thrissur", phone: "9447313278" },
    { name: "Anjith V G", address: "Gangothri Unity Nagar Kuriachira Thrissur 680008", phone: "9847165925" },
    { name: "Rohit S.", address: "Puthenpurayil House, kavitha road , Murattupuzha", phone: "9480188500" },
    { name: "Arjun asokan", address: "Villa 28, Grand County Villas, kakkanad", phone: "09442850682" },
    { name: "Thomas M David", address: "Mundackal, Near CMS College, Kottayam 686001", phone: "8281864295" },
    { name: "Sam Thomas", address: "Flat no 112, Metroparadise Apartment, edayakunnam kappela, cheranelloor, ernakulam", phone: "9496835972" },
    { name: "Dinesh Kadam", address: "Mangalore", phone: "9886312711" },
    { name: "Dr. Joseph Thomas", address: "Dept of Plastic Surgery, KMC Manipal, Udupi, Karnataka 576104", phone: "+919995783582" },
    { name: "FIRAS MOHAMMED A", address: "Department of Plastic Surgery,Aster MIMS, Kottakkal, Malappuram", phone: "9447785627" },
    { name: "Nibu Kuttappan", address: "Misty meadows villa c10 chala kannur kerala", phone: "9446470368" },
    { name: "Dr Hari Venkatramani", address: "3B Mayflower Woodside , Bharathi Park Main road , Saibaba Colony , Coimbatore 6410143", phone: "9842202422" },
    { name: "Dr Nitin Mokal", address: "SUSHRUT-7,MBPT Hospital Campus Wadala East Mumbai 400037", phone: "09820016700" },
    { name: "DR JITEN KULKARNI", address: "NIRMITI HOSPITAL, 4, ASHOK NAGAR, GARKHEDA, AURANGABAD", phone: "9822017579" },
    { name: "Dinesh Thekkinkattil", address: "44, Soothern Lane, Lincoln, Lincolnshire. LN2 2QJ. UK", phone: "+447912383436" },
    { name: "Achyutha Krishna Anum", address: "Sree Poomakripa 51/2757 Beside Poonithura Kottaram temple, Marad 682038", phone: "9113679515" }
];

async function importDoctors() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Insert doctors
        let count = 0;
        for (const data of doctorsList) {
            await Doctor.create({
                doctor_name: data.name,
                address: data.address,
                phone: data.phone
            });
            count++;
        }
        console.log(`Successfully imported ${count} doctors.`);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

importDoctors();
