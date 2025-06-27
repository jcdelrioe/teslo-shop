import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import * as bcrypt from 'bcrypt'

import { CreateUserDto, LoginUserDto } from './dto'
import { User } from './entities/user.entity'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      })

      await this.userRepository.save(user)
      user.password = '' // Remove password from the response for security reasons

      return user
      //TODO: Return el JWT de acceso
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true },
    })

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)')

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)')

    return user
    //TODO: Return el JWT de acceso
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail)

    console.log(error)

    throw new InternalServerErrorException('Please check server logs')
  }
}
