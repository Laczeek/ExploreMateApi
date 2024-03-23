"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const app_error_1 = __importDefault(require("./helpers/app-error"));
const error_controller_1 = __importDefault(require("./controllers/error.controller"));
const user_router_1 = __importDefault(require("./routers/user.router"));
const guide_router_1 = __importDefault(require("./routers/guide.router"));
const review_router_1 = __importDefault(require("./routers/review.router"));
(0, dotenv_1.config)();
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;
const app = (0, express_1.default)();
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use('/api/users', user_router_1.default);
app.use('/api/guides', guide_router_1.default);
app.use('/api/reviews', review_router_1.default);
app.use((req, res, next) => {
    throw new app_error_1.default(`${req.path} endpoint, does not exist.`, 404);
});
app.use(error_controller_1.default);
mongoose_1.default
    .connect(MONGO_URL)
    .then(() => {
    console.log('Connected with database.');
    app.listen(PORT, () => {
        console.log(`Server runs on ${PORT} port 🥳`);
    });
})
    .catch(err => {
    console.log(`Error occures 💥`);
    console.log(err);
});
