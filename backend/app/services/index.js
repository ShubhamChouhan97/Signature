import * as userService from './users.js';
import * as courtService from './courts.js';
import * as signatureService from './signature.js';
import * as templateService from './templates.js';
import * as dispatchService from './dispatchIndex.js';

export const userServices = userService;
export const courtServices = courtService
export const signatureServices = signatureService;
export const templateServices = templateService;
export const dispatchServices = dispatchService;

export default {
    userServices: userService,
    courtServices: courtService,
    templateServices: templateService,
    signatureServices: signatureService,
    dispatchServices: dispatchService,
}