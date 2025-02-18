import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { Thought, User } from '../models/index.js';

// Get and return all thought documents in the thought collection
export const getAllThoughts = async (_req: Request, res: Response) => {
    console.log('Getting all thoughts...')
    try {
        const thought = await Thought.find();

        const thoughtObj = {
            thought,
            thoughtCount: await thoughtCount()
        }
        console.log('List of thoughts retrieved!');
        res.json(thoughtObj);

    } catch (err: any) {
        console.error('There was an error retrieving all thoughts:', err);
        res.status(500).json({
            message: err.message
        });
    }
}

export const thoughtCount = async () => {
    const thoughtAmount = await Thought.aggregate()
        .count('thoughtCount');
    return thoughtAmount;
}

//Get and return a thought by its ID using the request params
export const getThoughtById = async (req: Request, res: Response) => {
    const { thoughtParamsId } = req.params;
    console.log(`Attempting to find thought: `, thoughtParamsId);
    const thoughtId = new ObjectId(thoughtParamsId)
    try {
        const thought = await Thought.findById(thoughtId);
        if (thought) {
            console.log(`Thought found!`);
            res.json({
                thought
            });
        } else {
            console.warn('Thought not found');
            res.status(404).json({
                message: 'Thought not found'
            });
        }
    } catch (err: any) {
        console.error(`There was an error retrieving the thought:`, err);
        res.status(500).json({
            message: err.message
        });
    }
};

//Create a new thought document based on a request body and store it in the thought collection
export const createThought = async (req: Request, res: Response) => {
    const { userId } = req.body;
    console.log(`Attempting to create thought and add it to user ${userId}`);
    const userOId = new ObjectId(userId as string);
    try {
        const user = await User.findById(userOId);
        if (user) {
            const createThought = await Thought.create(req.body);
            if (createThought) {
                const thoughtId = new ObjectId(createThought._id as string);
                const addThought = await User.findOneAndUpdate(
                    userOId,
                    { $addToSet: { thoughts: thoughtId } },
                    { runValidators: true, new: true }
                );
                if (addThought) {
                    console.log(`Thought created and added to user ${userId}`);
                    res.json({
                        createThought,
                        addThought
                    });
                }
            } else {
                console.warn('There was an error creating thought ');
                res
                    .status(500)
                    .json({ message: "There was an error creating the thought " })
            }
        } else {
            console.warn('User not found');
            res.status(404).json({
                message: 'User not found and, therefore, no thought was created'
            });
        }
    } catch (err: any) {
        console.error(`There was an error creating the thought: `, err);
        res.status(500).json({
            message: err.message
        });
    }
};

// Update a thought based on its ID using the request params and store the updated thought in the DB
export const updateThought = async (req: Request, res: Response) => {
    const { thoughtParamsId } = req.params;
    console.log(`Attempting to update thought:`, thoughtParamsId);
    const thoughtId = new ObjectId(thoughtParamsId);
    try {
        const thought = await Thought.findOneAndUpdate(
            thoughtId,
            req.body,
            { new: true }
        );
        if (thought) {
            console.log(`Thought updated!`);
            res.json({
                thought
            });
        } else {
            console.warn('Thought not found');
            res.status(404).json({
                message: 'Thought not found'
            });
        }
    } catch (err: any) {
        console.error(`There was an error updating the thought:`, err);
        res.status(500).json({
            message: err.message
        });
    }
};

//Delete a thought based on its ID using the request params
export const deleteThought = async (req: Request, res: Response) => {
    const { thoughtParamsId } = req.params;
    console.log(`Attempting to delete thought: `, thoughtParamsId);
    const thoughtId = new ObjectId(thoughtParamsId);
    try {
        const thought = await Thought.findOne(thoughtId);
        if (thought) {
            const user = thought.username;
            const updatedUser = await User.findOneAndUpdate(
                { 'username': user },
                { $pull: { thoughts: thoughtId } },
                { runValidators: true, new: true }
            );
            const response = await Thought.findOneAndDelete(thoughtId);
            if (response) {
                if (updatedUser) {
                    console.log(`Thought deleted and removed from user ${user}'s profile!`);
                    res.json({
                        updatedUser,
                        message: "Thought deleted successfully!"
                    });
                } else {
                    console.log(`The thought was deleted successfully, but no user was found to remove the thought from the user`);
                    res.json({
                        message: "The thought was deleted successfully, but no user was found to remove the thought from the user."
                    })
                }
            } else {
                console.error('There was an error deleting the thought!');
                res.status(500).json({
                    message: "There was an error deleting the thought!"
                });
            }
        } else {
            console.warn('Thought not found');
            res.status(404).json({
                message: 'Thought not found'
            });
        }


    } catch (err: any) {
        console.error(`There was an error deleting the user:`, err);
        res.status(500).json({
            message: err.message
        });
    }
};

//Add a reaction subdoc to a thought based on the requests params thought ID
export const addReaction = async (req: Request, res: Response) => {
    const { thoughtParamsId } = req.params;
    console.log(`Attempting to add reaction to thought ${thoughtParamsId}...`);
    const thoughtId = new ObjectId(thoughtParamsId);
    try {
        const thought = await Thought.findOneAndUpdate(
            thoughtId,
            { $addToSet: { reactions: req.body } },
            { runValidators: true, new: true }
        )
        if (thought) {
            console.log(`Reaction added to thought ${thoughtParamsId} successfully!`);
            res.json({
                thought
            });
        } else {
            console.warn('Thought not found');
            res.status(404).json({
                message: "The provided thought ID was not found"
            });
        }
    } catch (err: any) {
        console.log(`There was an error adding the reaction:`, err);
        res.status(500).json({
            message: err.message
        })
    }
}

//Remove a reaction from a thought using the thought ID from the requests params and the request body which will contain the reaction Id
export const removeReaction = async (req: Request, res: Response) => {
    const { thoughtParamsId } = req.params;
    console.log(`Attempting to delete reaction from thought: `, thoughtParamsId);
    const thoughtId = new ObjectId(thoughtParamsId);
    const reactionOId = new Types.ObjectId(req.body.reactionId as string);
    try {
        const thought = await Thought.findOne({ _id: thoughtId });
        if (thought) {
            for (let i = 0; i < thought.reactions.length; i++) {
                if (thought.reactions[i].reactionId.equals(reactionOId)) {
                    const thoughtUpdate = await Thought.findOneAndUpdate(
                        thoughtId,
                        { $pull: { reactions: { reactionId: thought.reactions[i].reactionId } } },
                        { runValidators: true, new: true }
                    );
                    if (thoughtUpdate) {
                        console.log('Reaction deleted successfully!');
                        return res.json({
                            thoughtUpdate
                        });
                    }
                }
            }
            console.warn('Reaction not found');
            return res.status(404).json({
                message: 'The reaction was not found!'
            });
        } else {
            console.warn('Thought not found');
            return res.status(404).json({
                message: 'The thought was not found!'
            });
        }
    } catch (err: any) {
        return res.status(500).json({
            message: err.message
        });
    }
}