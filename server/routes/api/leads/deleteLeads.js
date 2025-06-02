const express = require('express');
const router = express.Router();
const Leads = require('../../../models/Leads');
const { authValid, authValidWithDb } = require('../../../middlewares/auth');

// @route   DELETE api/leads/delete
// @desc    Delete leads by ID
// @access  Private
router.post('/', authValid, authValidWithDb, async (req, res) => {
    try {
        const userDetails = req.user.db;
        const { selection } = req.body;

        if (!selection || !Array.isArray(selection)) {
            return res.status(400).json({ status: false, msg: 'Please provide valid lead IDs' });
        }

        // Delete leads
        await Leads.deleteMany({ _id: { $in: selection }, userId: userDetails._id, });

        res.json({ status: true, msg: 'Leads deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;