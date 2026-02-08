import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from '../entities/product.entity'

export interface CatalogProduct {
  id: string
  name: string
  price: number
  description: string
  sellerType: 'FULL' | 'SIMPLE'
  imageUrl?: string | null
  videoUrl?: string | null
}

export interface CreateProductDto {
  name: string
  price: number
  description?: string
  sellerType: 'FULL' | 'SIMPLE'
  imageUrl?: string | null
  videoUrl?: string | null
}

export interface UpdateProductDto {
  name?: string
  price?: number
  description?: string
  sellerType?: 'FULL' | 'SIMPLE'
  imageUrl?: string | null
  videoUrl?: string | null
}

const SEED: Omit<CatalogProduct, 'id'>[] = [
  { name: 'Смартфон X', price: 29990, description: 'Экран 6.1", 128 ГБ, камера 12 Мп.', sellerType: 'FULL' },
  { name: 'Наушники Pro', price: 4990, description: 'Беспроводные, шумоподавление, до 30 ч работы.', sellerType: 'FULL' },
  { name: 'Чехол универсальный', price: 790, description: 'Силикон, защита по краям.', sellerType: 'SIMPLE' },
  { name: 'Зарядка быстрая 30W', price: 1490, description: 'USB-C, быстрая зарядка до 30 Вт.', sellerType: 'FULL' },
]

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count()
    if (count === 0) {
      await this.repo.save(SEED.map((s) => this.repo.create(s)))
    }
  }

  async findAll(): Promise<CatalogProduct[]> {
    const list = await this.repo.find({ order: { name: 'ASC' } })
    return list.map((p) => this.toCatalog(p))
  }

  private toCatalog(p: Product): CatalogProduct {
    return {
      id: String(p.id),
      name: p.name,
      price: Number(p.price),
      description: p.description,
      sellerType: p.sellerType as 'FULL' | 'SIMPLE',
      imageUrl: p.imageUrl ?? null,
      videoUrl: p.videoUrl ?? null,
    }
  }

  async create(dto: CreateProductDto): Promise<CatalogProduct> {
    const entity = this.repo.create({
      name: dto.name,
      price: dto.price,
      description: dto.description ?? '',
      sellerType: dto.sellerType,
      imageUrl: dto.imageUrl ?? null,
      videoUrl: dto.videoUrl ?? null,
    })
    const saved = await this.repo.save(entity)
    return this.toCatalog(saved)
  }

  async update(id: string, dto: UpdateProductDto): Promise<CatalogProduct | null> {
    const entity = await this.repo.findOne({ where: { id } })
    if (!entity) return null
    if (dto.name !== undefined) entity.name = dto.name
    if (dto.price !== undefined) entity.price = dto.price
    if (dto.description !== undefined) entity.description = dto.description
    if (dto.sellerType !== undefined) entity.sellerType = dto.sellerType
    if (dto.imageUrl !== undefined) entity.imageUrl = dto.imageUrl
    if (dto.videoUrl !== undefined) entity.videoUrl = dto.videoUrl
    const saved = await this.repo.save(entity)
    return this.toCatalog(saved)
  }
}
