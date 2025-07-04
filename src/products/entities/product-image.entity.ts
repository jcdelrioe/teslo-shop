import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Product } from './product.entity'

@Entity({ name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn() // sin argumento indica que es un autoincremental
  id: number

  @Column('text')
  url: string

  @ManyToOne(
    () => Product,
    (product) => product.images, // relación inversa
    { onDelete: 'CASCADE' },
  )
  product: Product
}
