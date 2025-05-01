import { Router } from "express";
import { userServices, courtServices } from "../../services/index.js";
import { roles, status } from "../../constants/index.js";
import { checkLoginStatus } from "../../middleware/checkAuth.js";
import { checkAdmin } from "../../middleware/checkAdmin.js";
import { UserCreationSchema, UserUpdateSchema } from "../../schema/user.js";
import { bcryptPass, generatePassword } from "../../libs/encryption.js";
import { sendNewUserEmail } from "../../libs/communication.js";
import { officerlist } from "../../controller/userController.js";

const router = Router();




router.get('/officer',checkLoginStatus, async (req, res, next) => {
  try {
    const courtID = req.session.courtId;
    const role = req.session.role;
    const officer = await officerlist(role,courtID); 
    return res.json(officer);
  } catch (error) {
    console.error("Error fetching officers:", error);
    next(error);
  }
});


router.get("/", checkLoginStatus, checkAdmin, async (req, res, next) => {
  try {
    const users = await userServices
      .find(
        {
          status: status.active,
          role: { $in: [roles.reader, roles.officer] },
        },
        {
          id: 1,
          name: 1,
          role: 1,
          email: 1,
          phoneNumber: 1,
          countryCode: 1,
          profile: 1,
          courtId: 1,
        },
        {}
      )
      .populate({
        path: "courtId",
        model: "court",
        localField: "courtId",
        foreignField: "id",
      });
    return res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:courtId",
  checkLoginStatus,
  checkAdmin,
  async (req, res, next) => {
    try {
      const courtId = req.params.courtId;
      const users = await userServices
        .find(
          {
            courtId: courtId,
            status: status.active,
          },
          {
            name: 1,
            id: 1,
            role: 1,
            email: 1,
            phoneNumber: 1,
            countryCode: 1,
            profile: 1,
            courtId: 1,
          },
          {}
        )
        .populate({
          path: "courtId",
          model: "court",
          localField: "courtId",
          foreignField: "id",
        });
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:courtId/:userId",
  checkLoginStatus,
  checkAdmin,
  async (req, res, next) => {
    try {
      const { courtId, userId } = req.params;
      const userObj = await userServices.findOne(
        {
          courtId: courtId,
          userId: userId,
        },
        {},
        {}
      );
      if (!userObj) {
        return res.status(404).json({
          error: "User not found",
        });
      }
      return res.json(userObj);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:courtId",
  checkLoginStatus,
  checkAdmin,
  async (req, res, next) => {
    console.log("hello");
    try {
      const courtId = req.params.courtId;
      const courtObj = await courtServices.findOne(
        {
          id: courtId,
          status: status.active,
        },
        {},
        {}
      );
      if (!courtObj) {
        return res.status(404).json({
          error: "Court not found",
        });
      }
      const body = await UserCreationSchema.safeParseAsync(req.body);
      if (!body.success) {
        return res.status(400).json({
          error: "Payload is not valid",
          detail: body.error,
        });
      }
      const userObj = body.data;
      userObj.createdBy = req.session.userId;
      userObj.updatedBy = req.session.userId;
      // const password = generatePassword(10);
      const password = "123456";
      sendNewUserEmail(userObj.email, password);
      userObj.password = await bcryptPass(password);
      userObj.courtId = courtObj.id;
      const user = await userServices.save(userObj);
      return res.json({
        id: user.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:courtId/:userId",
  checkLoginStatus,
  checkAdmin,
  async (req, res, next) => {
    try {
      const { courtId, userId } = req.params;
      const body = await UserUpdateSchema.safeParseAsync(req.body);
      if (body.error) {
        return res.status(400).json({
          error: `Payload is not valid`,
          detail: body.error,
        });
      }
      const userObj = await userServices.findOne(
        { id: userId, courtId: courtId, status: status.active },
        {},
        {}
      );
      if (!userObj) {
        return res.status(404).json({
          error: "User not found",
        });
      }
      const updatedObj = await userServices.updateOne(
        {
          id: userId,
          courtId: courtId,
        },
        { $set: body.data },
        {}
      );
      return res.json({
        id: userObj.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:courtId/:userId",
  checkLoginStatus,
  checkAdmin,
  async (req, res, next) => {
    try {
      const { courtId, userId } = req.params;
      const userObj = await userServices.findOne(
        {
          id: userId,
          courtId: courtId,
        },
        {},
        {}
      );
      if (!userObj) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      await userServices.updateOne(
        {
          id: userId,
          courtId: courtId,
        },
        {
          $set: {
            email: `${userObj.email}-Deleted-${Date.now()}`,
            phoneNumber: `${userObj.phoneNumber}-Deleted-${Date.now()}`,
            deletedBy: req.session.userId,
            status: status.deleted,
          },
        },
        {}
      );
      return res.json({
        id: userObj.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
