import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtSimpleGuard extends AuthGuard("jwt-simple") {}