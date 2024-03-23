"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const guide_model_1 = __importDefault(require("../models/guide.model"));
(0, dotenv_1.config)();
const guidesPath = path_1.default.join(__dirname, '..', '..', 'data', 'guides.json');
const guides = JSON.parse(fs_1.default.readFileSync(guidesPath, { encoding: 'utf-8' }));
mongoose_1.default
    .connect(process.env.MONGO_URL)
    .then(() => {
    return guide_model_1.default.deleteMany();
})
    .then(() => {
    const promises = guides.map((guide) => {
        return guide_model_1.default.create(guide);
    });
    return Promise.all(promises);
})
    .then(() => {
    console.log('GUIDES INSERTED!');
    return mongoose_1.default.disconnect();
})
    .catch(err => console.log(err))
    .finally(() => {
    process.exit();
});
