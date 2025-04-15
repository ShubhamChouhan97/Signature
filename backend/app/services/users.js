import  model from '../models/users.js';

export const find = (criteria, projection, options = {}) => {
    options.lean = true;
    return model.find(criteria, projection, options);
}

export const findOne = (criteria, projection, options = {}) => {
    options.lean = true;
    return model.findOne(criteria, projection, options);
}

export const updateOne = (criteria, updateObj, options = {}) => {
    
    return model.findOneAndUpdate(criteria, updateObj, { ...options, lean: true, new: true});
}

export const update = (criteria, updateObj, options = {}) => {
    options.lean = true;
    return model.updateMany(criteria, updateObj, options);
}

export const save = (saveObj) => {
    return new model(saveObj).save();
}