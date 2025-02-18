import { Router } from 'express';

const router = Router();

import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    addFriend,
    deleteFriend
} from '../../controllers/UserController.js';

router.route('/')
    .get(getAllUsers)
    .post(createUser);

// get, update, or delete a user using users object ID
router.route('/:userPId')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

// add or remove a friend to a user by using initially the users object ID, 
// and then the friends object ID in the params
router.route('/:userPId/friends/:friendPId')
    .post(addFriend)
    .delete(deleteFriend);

export { router as userRouter };