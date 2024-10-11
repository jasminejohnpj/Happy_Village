const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');
const router = express.Router();
const Admin = require('../model/admin');
const surveyform = require('../model/surveyform');
const Family = require('../model/familymembers');
const mongoose = require('mongoose');
const Newborn = require('../model/newborn');
const Childrens = require('../model/childrens');
const Youth = require('../model/youth');
const Middleage = require('../model/middleage');
const SeniorCitizen = require('../model/seniorcitizen');
const Supercitizen =require('../model/supercitizen');

router.post('/adminRegister' , async (req,res) =>{
    try{
        const { userName,password, role} = req.body;
        if(!userName ||!password ||!role){
            return res.status(400).json({message:'All fields are required'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({userName,password:hashedPassword, role});
        await admin.save();
        res.status(201).json({message:'Admin registered successfully'});

    } catch(error){
        console.error(error);
        res.status(500).json({message:'Internal server error'});
    }
});

router.post('/adminLogin', async (req, res) =>{
    try {
        const { userName, password, role } = req.body;
        if (!userName || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const admin = await Admin.findOne({ userName, role });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        res.json({ message: 'Admin logged in successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// router.get('/panchayathDetails', async (req, res) => {
//     try {
//         const { Panchayath } = req.body; 
//         console.log(Panchayath);
        
//         // Check if Panchayath is provided
//         if (!Panchayath) {
//             return res.status(400).json({ message: 'Panchayath is required' });
//         }

//         // Fetching the data with proper projection object
//         const data = await surveyform.find(
//             { Panchayath }, 
//             { 'Village': 1, 'Panchayath': 1, 'WardNo': 1, 'HouseholdHead': 1, 'HouseName': 1, 'HouseNo': 1, 'PostOffice': 1 ,'Pincode': 1,'FamilymembersNO': 1 }
//         );

//         // Handling no data found
//         if (data.length === 0) {
//             return res.status(404).json({ message: 'No data found for the given panchayath' });
//         }

//         // Returning success response with data
//         return res.status(200).json({
//             message: `Details for panchayath: ${Panchayath}`,
//             data
//         });
//     } catch (error) {
//         console.error('Error fetching panchayath details:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

router.get('/panchayathDetails', async (req, res) => {
    try {
        const { Panchayath } = req.body; 
        console.log(Panchayath);
        if (!Panchayath) {
            return res.status(400).json({ message: 'Panchayath is required' });
        }
        const data = await surveyform.find(
            { Panchayath }, 
           
        );
        if (data.length === 0) {
            return res.status(404).json({ message: 'No data found for the given panchayath' });
        }
        return res.status(200).json({
            message: `Details for panchayath: ${Panchayath}`,
            data
        });
    } catch (error) {
        console.error('Error fetching panchayath details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/wardDetails', async (req, res) => {
    try {
        const { Panchayath ,WardNo } = req.query; 
        
        if (!Panchayath) {
            return res.status(400).json({ message: 'Panchayath is required' });
        }
        const data = await surveyform.find({ Panchayath,WardNo });
        if (data.length === 0) {
            return res.status(404).json({ message: 'No data found for the given panchayath' });
        }
        return res.status(200).json({
            message: `Details for panchayath`,
            data
        });
    } catch (error) {
        console.error('Error fetching panchayath details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/familyDetails', async (req, res) => {
    try {
        const { Userid } = req.query; 
        // Check if Userid is provided
        if (!Userid) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Check if the Userid is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(Userid)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }
        // Convert the Userid string to ObjectId
        const objectId = new mongoose.Types.ObjectId(Userid);
        // Find family details using the converted ObjectId
        const data = await Family.find({ Userid: objectId });
        // If no data is found
        if (data.length === 0) {
            return res.status(404).json({ message: 'No data found for the given User ID' });
        }
        // Return family details
        return res.status(200).json({
            message: `Details for family ID: ${Userid}`,
            data
        });
    } catch (error) {
        console.error('Error fetching family details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/individualDetails', async function (req, res) {
    try {
        const { Userid, _id, Age } = req.query;

        // Check if all required fields are provided
        if (!Userid || !_id || !Age) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Convert Age from string to integer
        const age = parseInt(Age);

        // Validate and convert Userid and _id to ObjectId if necessary
        if (!mongoose.Types.ObjectId.isValid(Userid) || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: 'Invalid Userid or _id format' });
        }

        let data;

        // Check for age conditions
        if (age >= 0 && age <= 3) {
            // Newborn: age between 0 and 3
            data = await Newborn.findOne({ Userid: new mongoose.Types.ObjectId(Userid), _id: new mongoose.Types.ObjectId(_id) });
            if (!data) {
                return res.status(404).json({ message: 'Newborn details not found' });
            }
            return res.status(200).json({ message: 'Newborn details', data });

        } else if (age >= 4 && age <= 18) {
            // Children: age between 4 and 18
            data = await Childrens.findOne({ Userid: new mongoose.Types.ObjectId(Userid), _id: new mongoose.Types.ObjectId(_id) });
            if (!data) {
                return res.status(404).json({ message: 'Children\'s details not found' });
            }
            return res.status(200).json({ message: 'Children\'s details', data });

        } else if (age >= 19 && age <= 40) {
            // Youth: age between 19 and 40
            data = await Youth.findOne({ Userid: new mongoose.Types.ObjectId(Userid), _id: new mongoose.Types.ObjectId(_id) });
            if (!data) {
                return res.status(404).json({ message: 'Youth details not found' });
            }
            return res.status(200).json({ message: 'Youth details', data });

        } else if (age >= 41 && age <= 60) {
            // Middle-aged: age between 41 and 60
            data = await Middleage.findOne({ Userid: new mongoose.Types.ObjectId(Userid), _id: new mongoose.Types.ObjectId(_id) });
            if (!data) {
                return res.status(404).json({ message: 'Middle-aged details not found' });
            }
            return res.status(200).json({ message: 'Middle-aged details', data });

        } else if (age >= 61 && age <= 75) {
            // Senior Citizen: age between 61 and 75
            data = await SeniorCitizen.findOne({ Userid: new mongoose.Types.ObjectId(Userid), _id: new mongoose.Types.ObjectId(_id) });
            if (!data) {
                return res.status(404).json({ message: 'Senior Citizen details not found' });
            }
            return res.status(200).json({ message: 'Senior Citizen details', data });

        } else if (age >= 76) {
            // Super Senior Citizen: age above 76
            data = await Supercitizen.findOne({ Userid: new mongoose.Types.ObjectId(Userid), _id: new mongoose.Types.ObjectId(_id) });
            if (!data) {
                return res.status(404).json({ message: 'Super Senior Citizen details not found' });
            }
            return res.status(200).json({ message: 'Super Senior Citizen details', data });
        }

        // If age doesn't match any condition
        return res.status(400).json({ message: 'Invalid age range' });

    } catch (error) {
        console.error('Error fetching individual details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// router.get('/initialData' , async(req , res) =>{
//     try{
//         const data = await surveyform.find({}, { 'Village': 1, 'Panchayath': 1, 'WardNo': 1, 'HouseholdHead': 1, 'HouseName': 1, 'HouseNo': 1, 'PostOffice': 1 ,'Pincode': 1,'FamilymembersNO': 1 });
//         const family = await Family.find({});


//         return res.status(200).json(data , family);

//     } catch (error) {
//         console.error('Error fetching initial data:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// })

router.get('/initialData', async (req, res) => {
    try {
        // Fetching all survey forms with the specified fields
        const surveyData = await surveyform.find(
            {}, 
            { 'Village': 1, 'Panchayath': 1, 'WardNo': 1, 'HouseholdHead': 1, 'HouseName': 1, 'HouseNo': 1, 'PostOffice': 1, 'Pincode': 1, 'FamilymembersNO': 1 }
        );

        const result = await Promise.all(surveyData.map(async (survey) => {
            // Fetching family details where the Userid in Family matches the _id of the current surveyform
            const familyDetails = await Family.find({ Userid: survey._id });
            
            // Returning the survey and its associated family details
            return {
                survey,
                familyDetails
            };
        }));

        // Returning the survey data along with the associated family details
        return res.status(200).json(result);

    } catch (error) {
        console.error('Error fetching initial data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router