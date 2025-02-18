import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { User } from '../models/index.js';

//Get a count of all user documents in the user collection
export const userCount = async () => {
    const usersAmount = await User.aggregate()
        .count('userCount');
    return usersAmount;
}

//Get and return all user documents in the user collection
export const getAllUsers = async (_req: Request, res: Response) => {
    console.log('Getting all users ---')
    try {
        const users = await User.find();

        const usersObj = {
            users,
            userCount: await userCount()
        }
        console.log('List of users retrieved!');
        res.json(usersObj);

    } catch (err: any) {
        console.error('There was an error retrieving all users:', err);
        res.status(500).json({
            message: err.message
        });
    }
}

//Get and return a user by its ID using the request params
export const getUserById = async (req: Request, res: Response) => {
    const { userParamsId } = req.params;
    console.log(`Attempting to find user:`, userParamsId);
    const userId = new ObjectId(userParamsId)
    try {
        const user = await User.findById(userId);
        if (user) {
            console.log(`User found!`);
            res.json({
                user
            });
        } else {
            console.warn('User not found');
            res.status(404).json({
                message: 'User not found'
            });
        }
    } catch (err: any) {
        console.error(`There was an error retrieving the user:`, err);
        res.status(500).json({
            message: err.message
        });
    }
};

//Create a new user document based on a request body and store it in the user collection
export const createUser = async (req: Request, res: Response) => {
    console.log('Attempting to create user...')
    try {
        const user = await User.create(req.body);
        console.log(`User created successfully!`);
        res.status(201).json(user);
    } catch (err: any) {
        console.error(`There was an error creating the user: `, err);
        res.status(500).json({
            message: err.message
        });
    }
}

// function to update a user based on its ID using the request params and store the updated user in the DB
export const updateUser = async (req: Request, res: Response) => {
    const { userParamsId } = req.params;
    console.log(`Attempting to update user: `, userParamsId);
    const userId = new ObjectId(userParamsId)
    try {
        const user = await User.findOneAndUpdate(
            userId,
            req.body,
            { new: true }
        );
        if (user) {
            console.log(`User updated!`);
            res.json({
                user
            });
        } else {
            console.warn('User not found');
            res.status(404).json({
                message: 'User not found'
            });
        }
    } catch (err: any) {
        console.error(`There was an error updating the user:`, err);
        res.status(500).json({
            message: err.message
        });
    }
};

// Delete a user based on its ID using the request params
export const deleteUser = async (req: Request, res: Response) => {
    const { userParamsId } = req.params;
    console.log(`Attempting to delete user:`, userParamsId);
    const userId = new ObjectId(userParamsId)
    try {
        const response = await User.findOneAndDelete(userId);
        if (response) {
            console.log(`User deleted!`);
            res.json({
                message: "User deleted successfully!"
            });
        } else {
            console.warn('User not found');
            res.status(404).json({
                message: 'User not found'
            });
        }
    } catch (err: any) {
        console.error(`There was an error deleting the user:`, err);
        res.status(500).json({
            message: err.message
        });
    }
};

//Add a friend using both the users ID and the friends ID using request params, and add that friend to the friends array in the user if found
export const addFriend = async (req: Request, res: Response) => {
    const { userParamsId } = req.params;
    const { friendPId } = req.params;
    console.log(`Attempting to add friend ${friendPId} to user ${userParamsId}`);
    const userId = new ObjectId(userParamsId);
    const friendId = new ObjectId(friendPId);
    try {
        const friend = await User.findById(friendId);
        if (friend) {
            const response = await User.findOneAndUpdate(
                userId,
                { $addToSet: { friends: friendId } },
                { runValidators: true, new: true }
            );
            if (response) {
                console.log(`Friend ${friendPId} added to user ${userParamsId}`);
                res.json({
                    response
                });
            } else {
                console.warn('User not found');
                res.status(404).json({
                    message: 'User not found'
                });
            }
        } else {
            console.warn('Friend user ID not found');
            res.status(404).json({
                message: 'The user that is being added as a friend was not found'
            });
        }
    } catch (err: any) {
        console.error(`There was an error adding the friend:`, err);
        res.status(500).json({
            message: err.message
        });
    }
};

//Delete a friend using both the user ID and friend ID using the request params
export const deleteFriend = async (req: Request, res: Response) => {
    const { userParamsId } = req.params;
    const { friendPId } = req.params;
    console.log(`Attempting to remove friend ${friendPId} from user ${userParamsId}`);
    const userId = new ObjectId(userParamsId);
    const friendId = new ObjectId(friendPId);
    try {
        const response = await User.findOneAndUpdate(
            userId,
            { $pull: { friends: friendId } },
            { runValidators: true, new: true }
        );
        if (response) {
            console.log(`Friend ${friendPId} removed from user ${userParamsId}`);
            res.json({
                response
            });
        } else {
            console.warn('User not found');
            res.status(404).json({
                message: 'User not found'
            });
        }
    } catch (err: any) {
        console.error(`There was an error deleting the friend: `, err);
        res.status(500).json({
            message: err.message
        });
    }
};