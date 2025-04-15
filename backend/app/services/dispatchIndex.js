import model from '../models/dispatchRegister.js';

export const find = (criteria, projection, options = {}) => {
    options.lean = true;
    return model.find(criteria, projection, options);
}

export const findOne = (criteria, projection, options = {}) => {
    return model.findOne(criteria, projection, { ...options, lean: true });
}

export const updateOne = (criteria, updateObj, options = {}) => {
    options.lean = true;
    return model.findOneAndUpdate(criteria, updateObj, options);
}

export const update = (criteria, updateObj, options = {}) => {
    options.lean = true;
    return model.updateMany(criteria, updateObj, options);
}

export const deleteReq = (criteria, options = {}) => {
    return model.deleteMany(criteria, options)
}

export const save = (saveObj) => {
    return new model(saveObj).save();
}

/**
 * 
 * @param {Array<import('mongoose').PipelineStage>} aggregateArray 
 * @param {import('mongoose').AggregateOptions} options
 * @returns 
 */
export const aggregate = (aggregateArray, options) => {
    return model.aggregate(aggregateArray, options);
}

export const bulkWrite = (bulkWriteArray, options) => {
    return model.bulkWrite(bulkWriteArray, options);
}