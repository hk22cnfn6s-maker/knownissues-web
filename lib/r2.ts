import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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
 * Fetch an object's raw bytes from R2 into memory (e.g. to watermark a PDF
 * server-side, or serve an image through an internal API route).
 * @param filename The key / filename stored in R2 (e.g. "l322-buyers-guide.pdf")
 * @param bucket Defaults to CLOUDFLARE_R2_BUCKET_NAME (the guides bucket)
 */
export async function getObjectBuffer(
  filename: string,
  bucket: string | undefined = process.env.CLOUDFLARE_R2_BUCKET_NAME
): Promise<Buffer> {
  const client = getR2Client()
  if (!bucket) throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not set')

  const command = new GetObjectCommand({ Bucket: bucket, Key: filename })
  const response = await client.send(command)

  if (!response.Body) throw new Error(`Empty response body from R2 for ${filename}`)

  const bytes = await response.Body.transformToByteArray()
  return Buffer.from(bytes)
}

export async function putObject(
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const client = getR2Client()
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  )
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  const client = getR2Client()
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
