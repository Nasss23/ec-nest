import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Public, ResponseMessage } from '../decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('User login')
  @Post('login')
  async handleLogin(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response);
  }

  //Register
  @Public()
  @ResponseMessage('Register a new user')
  @Post('register')
  registerAuth(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }
}
