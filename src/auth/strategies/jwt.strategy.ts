import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Repository } from 'typeorm'

import { JwtPayload } from '../interfaces/jwt-payload.interface'

import { User } from '../entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET')
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration')
    }
    super({
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    })
  }
  async validate(payload: JwtPayload): Promise<User> {
    const { email } = payload

    const user = await this.userRepository.findOneBy({ email })

    if (!user) throw new UnauthorizedException('Token not valid')
    if (!user.isActive)
      throw new UnauthorizedException('User is inactive, talk to an admin')

    return user
  }
}
