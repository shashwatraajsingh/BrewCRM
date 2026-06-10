"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubQueueModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const delivery_processor_1 = require("./delivery.processor");
let StubQueueModule = class StubQueueModule {
};
exports.StubQueueModule = StubQueueModule;
exports.StubQueueModule = StubQueueModule = __decorate([
    (0, common_1.Module)({
        imports: [bull_1.BullModule.registerQueue({ name: 'delivery-simulation' })],
        providers: [delivery_processor_1.DeliveryProcessor],
    })
], StubQueueModule);
//# sourceMappingURL=queue.module.js.map