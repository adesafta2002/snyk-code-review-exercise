"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(404).json({ message: err.message });
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.js.map