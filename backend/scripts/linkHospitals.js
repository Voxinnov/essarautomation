require('dotenv').config();
const sequelize = require('../config/database');
const { Doctor, Hospital } = require('../models');

// Data mappings derived from the Excel excerpt
const doctorHospitals = [
    { name: "Jimmy Mathew", hospital_name: null, location: "404, NATIONAL EXCELLENCY, KALAVATH ROAD, Palarivattam" },
    { name: "Aniraj R", hospital_name: "Govt Medical College", location: "Thiruvananthapuram" },
    { name: "PRINCE HP", hospital_name: "ELITE MISSION HOSPITAL", location: "KOORKENCHERY ,THRISSUR" },
    { name: "Dr Ajai kumar kamath", hospital_name: null, location: "Akarshan, green acres , parolickal ettumanoor" },
    { name: "Dr Kunhambu Nambiar", hospital_name: "Lakshmi", location: "13/834A, chemmattamvayal, BALLA POST, KANHANGAD , Kasaragod671532" },
    { name: "Dr.DURGA M.L.S", hospital_name: "Amritha Medical College", location: "ponnekara, kochi" },
    { name: "DR JOSE THARAYIL", hospital_name: null, location: ".,MUTTATHIL LANE, KADAVANVTHARA, KOCHI 682020" },
    { name: "Pradeep Kumar", hospital_name: null, location: "A 1141 , sobha topaz , sobha city , thrissur , kerala. 680553" },
    { name: "Priyavrata Rajasubramanian", hospital_name: "Government Medical College", location: "Kozhikode" },
    { name: "Dr. VINU ROY", hospital_name: "Villa no:41,Haritha homes", location: "Vadookkara,Thrissur" },
    { name: "DR P KISHORE", hospital_name: "Amritahyanam", location: "31/514, AKG ROAD, EDAPPALLY PO, Pin 682024, Ernakulam" },
    { name: "CHARLES JUDE ANTO", hospital_name: null, location: "Thettayil house, Konni P.O., Pathanamthitta district. Pin - 689691" },
    { name: "Dr Cyril Joseph", hospital_name: null, location: "The Dream , Kudakasseril House, Kattode, Manjadi. PO, Thiruvalla, Kerala-689105" },
    { name: "NANDAKUMAR. U. R", hospital_name: null, location: "TC 26/1731, \"Lakshmi\", Vadayakkad Jn., Vanchiyoor P. O, Trivandrum - 695035" },
    { name: "Patrick Paul", hospital_name: "Travancore Medicity", location: "Room 19, Doctors Quarters, Kollam." },
    { name: "LINTO T. MATHEW", hospital_name: "GOVT", location: "SENIOR RESIDENT, DEPARTMENT OF PLASTIC AND RECONSTRUCTIVE SURGERY" },
    { name: "Paul Joyce", hospital_name: null, location: "Payyapilly house, Eden 10, Kavaraparambu, Nayathode PO, Angamaly, Kerala." },
    { name: "Sri Valli Vemulapalli", hospital_name: "Amrita Institute of Medical Science", location: "edappally, kochi" },
    { name: "Greshma T R", hospital_name: null, location: "W/o Jose paul.43-F,STP pipeline road,elamkulam,682020" },
    { name: "Sannia Salim", hospital_name: null, location: "Valanjambalam pallimukku kochi" },
    { name: "DR AJAI K S", hospital_name: "ELITE MISSION HOSPITAL", location: "KOORKENCHERY" },
    { name: "RANITHA RAVINDRAN", hospital_name: "Lakshmi Smrithi", location: "Minalur P.O, Mulakunnathukavu Via, Thrissur 680581" },
    { name: "Alexander G", hospital_name: "EMC Hospital", location: "kochi, kerala , India" },
    { name: "Anoop S.", hospital_name: "MOSC Medical College", location: "Kolenchery, Ernakulam. 682311" },
    { name: "ATHIRA C", hospital_name: "GMC", location: "TVM" },
    { name: "Akshaya M", hospital_name: "Government Medical College", location: "Kozhikode" },
    { name: "AMAL T S", hospital_name: null, location: "SAAJ BHAVAN, PATTANAKKAD P O, CHERTHALA, ALAPPUZHA, 688531" },
    { name: "AKSHAI GEORGE PAUL", hospital_name: "Aster MIMS", location: "Calicut" },
    { name: "Steve Reji Thomas", hospital_name: null, location: "Amayil house, Nannuvacadu, Pathanamthitta, Kerala, 689645" },
    { name: "Shubha Lakshmi Kadukk", hospital_name: "Amrita hospital", location: "ponnekara road Edappally, Ernakulam kochi, Kerala." },
    { name: "Sheyon Yohannan", hospital_name: null, location: "Kolangara MansionNear Christ College Junction, Thrissur Shornur Road, Irinjalakuda, Thrissur" },
    { name: "Thomas Punnoose", hospital_name: null, location: "Pulimoottil House, Kunnamthanam P.O, Pathanamthitta Dt, 689581" },
    { name: "JAGADEESH SREENIVA", hospital_name: null, location: "Indeevaram, Near Nelliekodu housing colony, Kavu bus stop,Chevayour P OCalicut. Pin 673017" },
    { name: "Nidhi Miriam Eapen", hospital_name: null, location: "Kochuveettil Bethel, Kozhencherry East (PO), Pathanamthitta -689641" },
    { name: "DR DRISHYA DEVASIA", hospital_name: null, location: "ALRA 11B, Ashramam Lane, Azad Road, Kaloor, Kochi 682017" },
    { name: "DEEPAK ARAVIND", hospital_name: null, location: "Dhwani,Behind Orchid Cafe,BETHELPADI,KUTTAPUZHA P O,THIRUVALLA, PATHANAMTHIT" },
    { name: "Sreelal Sreedharan", hospital_name: null, location: "TC3/502(10),sandhram, GSN77,Gandhismaraka nagar,muttada.p.o,Trivandrum 695025" },
    { name: "Dr. Sharika Chandran", hospital_name: null, location: "ARA 117, Athani Lane, Vanchiyur, Trivandrum" },
    { name: "AARATHI ANTHARJAN", hospital_name: "BABY MEMORIAL HOSPITAL", location: "KANNUR" },
    { name: "THUSHARA K R", hospital_name: null, location: "T C- 43/510(2), Ariyan kuzhi, Manacaud. P.O, Trivandrum,  695009, Kerala" },
    { name: "Subramania Iyer", hospital_name: null, location: "Tower 2 17c tritvam apartment marine drive extension kochi 682018" },
    { name: "Lekshmi M", hospital_name: "GMC", location: "Kottayam" },
    { name: "Jyoshid R Balan", hospital_name: "Elite Meadows", location: "Amalanagar" },
    { name: "Sharun Abey Kurian", hospital_name: "GMC", location: "Kottayam" },
    { name: "Aswathy Chandran", hospital_name: null, location: "Flat number 7F, Skyline grace apartment, Cathedral church road,Pala, Kottayam" },
    { name: "Dr.Faiyaz Abdul Jabbar", hospital_name: "KMP Swapnapuri", location: "Chembukkavu, Thrissur - 680020" },
    { name: "R. Jayakumar", hospital_name: "Specialists hospital", location: "Kochi" },
    { name: "Deepak Shanbhag", hospital_name: "4A Si Coral crest", location: "SRM road, Ernakulum north" },
    { name: "ABHIJITH ANTONY", hospital_name: null, location: "Flat No 5103, Tower 5, Prestige Hillside Gateway, Infopark Road Kakkanad , Kalappurakkal," },
    { name: "Sarath TS", hospital_name: null, location: "Flat no 3E ArtechPalmgrove , Polayathodu,Kollam" },
    { name: "DIVYA SYAM", hospital_name: "LISIE HOSPITAL", location: "3C, DD WEST WINDS, ROAD, KACHERIPADY, KOCHI" },
    { name: "Joyal Jose", hospital_name: null, location: "Eluvathingal, Anakkal, Kanjirapally, Kottayam" },
    { name: "Aneesh Joseph", hospital_name: null, location: "Punnolikunnel house, Thankamany P O, idukki 685584" },
    { name: "Renji Issac james", hospital_name: null, location: "Puliyunnil house, kanjar p o" },
    { name: "Sankar Das", hospital_name: "Shivashakthi", location: "GP Road,Near mariyamman Kovil" },
    { name: "Dr Hemang Arvindkuma", hospital_name: null, location: "6c mulberry mystic rose St Christopher lane Kizhakkumpattukara near nirmalamata school thris" },
    { name: "Pradeoth Mukundan Ko", hospital_name: "Confident aries", location: "Villa no.2, Vilvattom, Kuriachira  P.O. Thrissur, Kerala 680006" },
    { name: "Dr Sheeja Rajan TM", hospital_name: null, location: "Shrirang, Chevayur, Kozhikode" },
    { name: "Dr.S.Zuveriya Zasreen", hospital_name: null, location: "Flat no 402 Prasanna Vihar Army flat AWHO ,Marine drive,Kochi ,Kerala 682018" },
    { name: "Dr. Navien Issac John", hospital_name: "Jubilee Mission Medical College", location: "Thrissur" },
    { name: "MANOJ KUSHRA R", hospital_name: null, location: "Srishti TRRA 135C Chalkavattom Vennala PO. Ernakulam 682028" },
    { name: "P K MOHANAN", hospital_name: "Amala Medical College", location: "Thrissur" },
    { name: "Sreelesh Sreedhar", hospital_name: null, location: "Thaara House, Nanminda P O, Kozhikode 673613" },
    { name: "Dr Bhaskara k g", hospital_name: "Medical trust Hospital", location: "kochi" },
    { name: "Shaji Mathew", hospital_name: "Yasoram Garden", location: "Plot-17, phase-1, Ollur P. O, Thrissur, PIN 680306" },
    { name: "M.V.Raman", address: null, location: "Maheswari, 134 - Westhill,Thrissur PIN 680006" },
    { name: "DEEPAK B", hospital_name: "Almas hospital", location: "Kottakal" },
    { name: "Jayakrishnan kolady", hospital_name: "Amala Hospital", location: "Trissur" },
    { name: "Dinkar Sreekumar", hospital_name: null, location: "Flat No. 7G, 7th Floor, Soubhagya Apartments,Indira Gandhi Road,Puthiyara PO, Kozhikode" },
    { name: "Akhila Mohan", hospital_name: "Travancore meridian", location: "kannammoola P.O,Trivandrum" },
    { name: "Sabu C.P.", hospital_name: "Ulloor Medical College", location: "SARAL NLRA 6 Neerazhi lane P O Trivandrum" },
    { name: "John Oommen", hospital_name: null, location: "30, Kanniya nagar TVS nagar road Koundampalayam, Coimbatore 641030" },
    { name: "James Roy Kanjoor", hospital_name: null, location: "No 20 MTP road Coimbatore 641043" },
    { name: "Helen Mary Titus", hospital_name: null, location: "Kalathiparambil house,palliport po ,ernakulam" },
    { name: "Gigv Raj Kulangara", hospital_name: "Rajagiri Hospital", location: "Aluva" },
    { name: "Dr Abraham G Thomas", hospital_name: null, location: "Gracefield, Thamarassery 673573" },
    { name: "BINOD PRABHAKARAN", hospital_name: null, location: "TC 4/883 MOKKATIL KOWDIAR TRIVANDRUM" },
    { name: "Praveen A J", hospital_name: "Asset silverstreak apartments", location: "11b, Keezhmad, KUTTAMASSERY, Ernakulam, 683105" },
    { name: "Sanju Samuel", hospital_name: null, location: "Edapally,kochi" },
    { name: "Asish George Daniel", hospital_name: "Medical College", location: "Shelumiel, SRA-22, Sreemoolam road, Kumarapuram, PO, Thiruvananthapura" },
    { name: "Philip Philip Puthumana", hospital_name: null, location: "Puthumana, I.T.I junction, Chengannur P.O,PIN 689121" },
    { name: "Dr Suneesh P J", hospital_name: null, location: "Pulikottil House, Harmony lane, Laloor road, Thrissur" },
    { name: "Anjith V G", hospital_name: null, location: "Gangothri Unity Nagar Kuriachira Thrissur 680008" },
    { name: "Rohit S.", hospital_name: null, location: "Puthenpurayil House, kavitha road , Murattupuzha" },
    { name: "Arjun asokan", hospital_name: "Grand County Villas", location: "Villa 28, kakkanad" },
    { name: "Thomas M David", hospital_name: "CMS College", location: "Mundackal, Near Kottayam 686001" },
    { name: "Sam Thomas", hospital_name: null, location: "Flat no 112, Metroparadise Apartment, edayakunnam kappela, cheranelloor, ernakulam" },
    { name: "Dinesh Kadam", hospital_name: null, location: "Mangalore" },
    { name: "Dr. Joseph Thomas", hospital_name: "KMC", location: "Manipal, Udupi, Karnataka 576104" },
    { name: "FIRAS MOHAMMED A", hospital_name: "Aster MIMS", location: "Kottakkal, Malappuram" },
    { name: "Nibu Kuttappan", hospital_name: null, location: "Misty meadows villa c10 chala kannur kerala" },
    { name: "Dr Hari Venkatramani", hospital_name: "Mayflower Woodside", location: "3B , Bharathi Park Main road , Saibaba Colony , Coimbatore 6410143" },
    { name: "Dr Nitin Mokal", hospital_name: "MBPT Hospital", location: "SUSHRUT-7, Campus Wadala East Mumbai 400037" },
    { name: "DR JITEN KULKARNI", hospital_name: "NIRMITI HOSPITAL", location: "4, ASHOK NAGAR, GARKHEDA, AURANGABAD" },
    { name: "Dinesh Thekkinkattil", hospital_name: null, location: "44, Soothern Lane, Lincoln, Lincolnshire. LN2 2QJ. UK" },
    { name: "Achyutha Krishna Anum", hospital_name: null, location: "Sree Poomakripa 51/2757 Beside Poonithura Kottaram temple, Marad 682038" }
];

async function linkHospitals() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // For each mapping, find or create the hospital, then update the doctor
        let updatedCount = 0;
        let createdHospitals = 0;

        for (const data of doctorHospitals) {
            // First, find the doctor since we could have multiple runs
            const doctor = await Doctor.findOne({ where: { doctor_name: data.name } });
            
            if (doctor && data.hospital_name) {
                // Find or create hospital
                const [hospital, created] = await Hospital.findOrCreate({
                    where: { hospital_name: data.hospital_name },
                    defaults: {
                        location: data.location || ''
                    }
                });

                if (created) createdHospitals++;

                // Link hospital
                doctor.hospital_id = hospital.id;
                await doctor.save();
                updatedCount++;
            }
        }

        console.log(`Successfully created ${createdHospitals} hospitals and linked ${updatedCount} doctors.`);
    } catch (error) {
        console.error('Error linking hospitals:', error);
    } finally {
        await sequelize.close();
    }
}

linkHospitals();
