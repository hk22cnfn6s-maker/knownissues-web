import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  if (!accountId) throw new Error('CLOUDFLARE_R2_ACCOUNT_ID is not set')

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? '',
    },
  })
}

/**
 * Fetch a PDF's raw bytes from R2 into memory so it can be processed
 * (e.g. watermarked) server-side before being served to the client.
 * @param filename The key / filename stored in R2 (e.g. "l322-buyers-guide.pdf")
 */
export async function getObjectBuffer(filename: string): Promise<Buffer> {
  const client = getR2Client()
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME
  if (!bucket) throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not set')

  const command = new GetObjectCommand({ Bucket: bucket, Key: filename })
  const response = await client.send(command)

  if (!response.Body) throw new Error(`Empty response body from R2 for ${filename}`)

  const bytes = await response.Body.transformToByteArray()
  return Buffer.from(bytes)
}
