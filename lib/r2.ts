import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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
 * Generate a pre-signed GET URL for a PDF in R2.
 * @param filename  The key / filename stored in R2 (e.g. "l322-buyers-guide.pdf")
 * @param expiresIn Seconds until the URL expires (default 300 = 5 minutes)
 */
export async function getSignedDownloadUrl(
  filename: string,
  expiresIn = 300
): Promise<string> {
  const client = getR2Client()
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME
  if (!bucket) throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not set')

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: filename,
    // Suggest the browser save with the original filename
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  })

  return getSignedUrl(client, command, { expiresIn })
}
