import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ProductsService } from './../products/products.service'
import { initialData } from './data/seed-data'
import { User } from '../auth/entities/user.entity'

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables()

    const adminUser = await this.insertUsers()

    await this.insertNewProducts(adminUser)
    return 'Seed executed successfully'
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts()

    const queryBuilder = this.userRespository.createQueryBuilder()
    await queryBuilder.delete().where({}).execute()
  }

  private async insertUsers() {
    const seedUsers = initialData.users

    const users: User[] = []

    seedUsers.forEach((user) => {
      users.push(this.userRespository.create(user))
    })
    const dbUsers = await this.userRespository.save(seedUsers)

    return dbUsers[0]
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts()

    const products = initialData.products

    const insertPromises: Promise<any>[] = []

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user))
    })

    await Promise.all(insertPromises)

    return true
  }
}
