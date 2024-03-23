"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiFeatures {
    constructor(Model, queryObj) {
        this.queryObj = queryObj;
        const notFilters = ['sort', 'page', 'limit', 'select'];
        let filter = Object.assign({}, queryObj);
        Object.keys(filter).forEach(key => {
            if (notFilters.includes(key)) {
                delete filter[key];
            }
        });
        filter = JSON.stringify(filter);
        filter = JSON.parse(filter.replace(/\b(gt|gte|lt|lte|eq|ne)\b/g, (match) => `$${match}`));
        this.query = Model.find(filter);
    }
    pagination() {
        const maxDocumentsPerPage = +this.queryObj.limit || 8;
        const page = +this.queryObj.page || 1;
        this.query = this.query.skip((page - 1) * maxDocumentsPerPage).limit(maxDocumentsPerPage);
        return this;
    }
    projection() {
        if (this.queryObj.select) {
            const selectString = this.queryObj.select.replace(/,/g, ' ');
            this.query = this.query.select(selectString);
        }
        else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    sort() {
        if (this.queryObj.sort) {
            const sortString = this.queryObj.sort.replace(/,/g, ' ');
            this.query = this.query.sort(sortString);
        }
        return this;
    }
}
exports.default = ApiFeatures;
