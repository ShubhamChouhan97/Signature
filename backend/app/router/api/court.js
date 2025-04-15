import { Router } from 'express';
import * as courtServices from '../../services/courts.js';
import { roles, status } from '../../constants/index.js';
import { checkLoginStatus } from '../../middleware/checkAuth.js';
import { checkAdmin } from '../../middleware/checkAdmin.js';
import { CourtCreationSchema } from '../../schema/court.js';
import mongoose from 'mongoose';
import { userServices } from '../../services/index.js';
import courtModel from "../../models/courts.js"

const router = Router();
router.get('/', checkLoginStatus, checkAdmin, async (req, res, next) => {
    try {

        const courtsWithUserCounts = await courtModel.aggregate([
            {
                $match: { status: status.active }
            },
            {
                $lookup: { 
                    from: "users",
                    localField: "id",
                    foreignField: "courtId",
                    as: "userCount",
                }
            },
            {
                $addFields: {
                    userCount: { $size: {
                        $filter: {
                            input: "$userCount",
                            as: "userCount",
                            cond: {$eq: ["$$userCount.status", status.active]}
                        }
                    }}
                }
            },
        ])
        return res.json(courtsWithUserCounts);
    } catch (error) {
        next(error);
    }
});

router.get('/officerForAssignment', checkLoginStatus, async (req, res, next) => {
    try {
        const courtId = req.session.courtId;
        if (!courtId) {
            return res.status(403).json({
                error: "User not assigned to any court",
            });
        }
        const users = await userServices.find({
            courtId: courtId,
            status: status.active,
            role: roles.officer,
        }, { name: 1, id: 1 });
        return res.json(users);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', checkLoginStatus, checkAdmin, async (req, res, next) => {
    const id = req.params.id;
    try {
        const court = await courtServices.findOne({
            id: id,
        }, {}, {});
        return res.json(court);
    } catch (error) {
        next(error);
    }
})

router.post('/', checkLoginStatus, checkAdmin, async (req, res, next) => {
    try {
        const body = await CourtCreationSchema.safeParseAsync(req.body);
        if (body.error) {
            return res.status(400).json({
                error: 'Invalid payload',
                detailed: error,
            });
        }
        const creationObj = body.data;
        creationObj.id = new mongoose.Types.ObjectId();
        creationObj.createdBy = req.session.userId;
        creationObj.updatedBy = req.session.userId;
        const obj = await courtServices.save(creationObj);
        return res.json({
            id: obj.id,
        })
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', checkLoginStatus, checkAdmin, async (req, res, next) => {
    try {
        const id = req.params.id;
        const court = await courtServices.findOne({
            id: id,
            status: status.active,
        }, {}, {});
        if (!court) {
            return res.status(404).json({ error: 'Court not found' });
        }
        const body = await CourtCreationSchema.safeParseAsync(req.body);
        if (body.error) {
            return res.status(400).json({
                error: 'Invalid payload',
                detailed: error,
            });
        }
        const updateObj = body.data;
        updateObj.updatedBy = req.session.userId;
        const obj = await courtServices.updateOne({ id: court.id }, {
            $set: {
                ...updateObj,
            }
        }, {});
        return res.json({
            id: obj.id,
        })
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', checkLoginStatus, checkAdmin, async (req, res, next) => {
    try {
        const id = req.params.id;
        const court = await courtServices.findOne({
            id: id,
            status: status.active,
        }, {}, {});
        if (!court) {
            return res.status(404).json({ error: 'Court not found' });
        }

        await courtServices.updateOne({
            id: id,
        }, { $set: { status: status.deleted } }, {});
        return res.json({ id: court.id });
    } catch (error) {
        next(error);
    }
});

export default router;