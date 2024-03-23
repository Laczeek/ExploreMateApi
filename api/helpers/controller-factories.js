"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_features_1 = __importDefault(require("./api-features"));
const app_error_1 = __importDefault(require("./app-error"));
const getAll = (Model) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const apiFeat = new api_features_1.default(Model, req.query).pagination().projection().sort();
            const documents = yield apiFeat.query;
            const modelname = `${Model.modelName}s`;
            res.status(200).json({ status: 'success', length: documents.length, [modelname.toLowerCase()]: documents });
        }
        catch (err) {
            next(err);
        }
    });
};
const getOne = (Model) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const modelname = Model.modelName;
            let document;
            if (modelname === 'Guide') {
                document = yield Model.findById(id).populate({ path: 'reviews', select: '-__v' });
            }
            else {
                document = yield Model.findById(id);
            }
            if (!document) {
                throw new app_error_1.default(`${modelname} with provided id does not exists.`, 404);
            }
            res.status(200).json({ status: 'success', [modelname.toLowerCase()]: document });
        }
        catch (err) {
            next(err);
        }
    });
};
const updateOne = (Model) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            if (req.body.localization) {
                req.body.localization = JSON.parse(req.body.localization);
            }
            let pushQuery = {};
            if (req.body.startDates) {
                const newDates = JSON.parse(req.body.startDates);
                delete req.body['startDates'];
                pushQuery = { $addToSet: { startDates: { $each: newDates } } };
            }
            const updatedDocument = yield Model.findByIdAndUpdate(id, Object.assign(Object.assign({}, req.body), pushQuery), { runValidators: true, new: true });
            const modelname = Model.modelName;
            if (!updatedDocument) {
                throw new app_error_1.default(`${modelname} with provided id does not exists.`, 404);
            }
            res.status(200).json({ status: 'success', [modelname.toLowerCase()]: updatedDocument });
        }
        catch (err) {
            next(err);
        }
    });
};
const deleteOne = (Model) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const deletedDocument = yield Model.findByIdAndDelete(id);
            const modelname = Model.modelName;
            if (!deletedDocument) {
                throw new app_error_1.default(`${modelname} with provided id does not exists.`, 404);
            }
            res.status(204).json();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.default = {
    getAll,
    getOne,
    updateOne,
    deleteOne,
};
