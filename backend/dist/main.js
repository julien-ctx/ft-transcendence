"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const socketAdapter_1 = require("./socketAdapter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true
    }));
    app.enableCors();
    app.useWebSocketAdapter(new socketAdapter_1.SocketAdapter(app));
    await app.listen(new config_1.ConfigService().get("PORT"));
}
bootstrap();
//# sourceMappingURL=main.js.map