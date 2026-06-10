"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentsController = void 0;
const common_1 = require("@nestjs/common");
const segments_service_1 = require("./segments.service");
class CreateSegmentDto {
}
let SegmentsController = class SegmentsController {
    constructor(segmentsService) {
        this.segmentsService = segmentsService;
    }
    async findAll() {
        return this.segmentsService.findAll();
    }
    async create(dto) {
        return this.segmentsService.create(dto);
    }
    async findOne(id, limit, offset) {
        return this.segmentsService.findOneWithCustomers(id, {
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
    }
    async remove(id) {
        await this.segmentsService.remove(id);
        return { deleted: true };
    }
    async refresh(id) {
        return this.segmentsService.refreshCount(id);
    }
};
exports.SegmentsController = SegmentsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSegmentDto]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/refresh'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SegmentsController.prototype, "refresh", null);
exports.SegmentsController = SegmentsController = __decorate([
    (0, common_1.Controller)('segments'),
    __metadata("design:paramtypes", [segments_service_1.SegmentsService])
], SegmentsController);
//# sourceMappingURL=segments.controller.js.map