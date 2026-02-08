import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { randomUUID } from 'node:crypto'

const UPLOADS_DIR = 'uploads'

@Injectable()
export class MediaService {
  private s3: S3Client | null = null
  private bucket: string = ''
  private publicBaseUrl: string = ''
  private useS3 = false

  constructor(private config: ConfigService) {
    const endpoint = this.config.get<string>('S3_ENDPOINT')
    const accessKey = this.config.get<string>('S3_ACCESS_KEY')
    const secretKey = this.config.get<string>('S3_SECRET_KEY')
    this.bucket = this.config.get<string>('S3_BUCKET') || ''
    this.publicBaseUrl = this.config.get<string>('S3_PUBLIC_URL') || ''

    if (endpoint && accessKey && secretKey && this.bucket && this.publicBaseUrl) {
      this.useS3 = true
      this.s3 = new S3Client({
        endpoint,
        region: this.config.get<string>('S3_REGION') || 'us-east-1',
        forcePathStyle: false,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      })
    } else {
      try {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true })
      } catch {}
    }
  }

  async upload(file: Express.Multer.File): Promise<{ url: string }> {
    const ext = path.extname(file.originalname) || '.bin'
    const key = `${randomUUID()}${ext}`

    if (this.useS3 && this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      )
      const url = this.publicBaseUrl.endsWith('/') ? `${this.publicBaseUrl}${key}` : `${this.publicBaseUrl}/${key}`
      return { url }
    }

    const dir = path.join(process.cwd(), UPLOADS_DIR)
    const filename = `${randomUUID()}${ext}`
    const filepath = path.join(dir, filename)
    fs.writeFileSync(filepath, file.buffer)
    const baseUrl = this.config.get<string>('APP_PUBLIC_URL') || 'http://localhost:3001'
    const url = `${baseUrl.replace(/\/$/, '')}/uploads/${filename}`
    return { url }
  }
}
