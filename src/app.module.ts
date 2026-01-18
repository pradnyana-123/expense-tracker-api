import { Module } from "@nestjs/common";
import { CommonModule } from "./common/common.module";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { CategoryModule } from "./category/category.module";
import { ExpenseModule } from "./expense/expense.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./guards/auth.guard";
@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    UserModule,
    CategoryModule,
    ExpenseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
