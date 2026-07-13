import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'

const DIAGONAL_TEXT = 'KnownIssues.co.uk'
const DIAGONAL_FONT_SIZE = 60
const DIAGONAL_OPACITY = 0.15
const DIAGONAL_ANGLE_DEGREES = 45

const FOOTER_FONT_SIZE = 8
const FOOTER_OPACITY = 0.6
const FOOTER_MARGIN = 24

/** Anchor position so that rotated text is visually centred on the page. */
function centeredRotatedOrigin(
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number,
  angleDegrees: number
) {
  const angle = (angleDegrees * Math.PI) / 180
  const dx = textWidth / 2
  const dy = textHeight / 2
  const rotatedDx = dx * Math.cos(angle) - dy * Math.sin(angle)
  const rotatedDy = dx * Math.sin(angle) + dy * Math.cos(angle)

  return {
    x: pageWidth / 2 - rotatedDx,
    y: pageHeight / 2 - rotatedDy,
  }
}

/**
 * Stamps every page of a PDF with a diagonal brand watermark and a
 * per-download footer identifying the downloading user. Returns a fresh
 * buffer — nothing is written back to storage.
 */
export async function watermarkPdf(
  pdfBytes: Buffer,
  userEmail: string
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const diagonalWidth = font.widthOfTextAtSize(DIAGONAL_TEXT, DIAGONAL_FONT_SIZE)
  const diagonalHeight = font.heightAtSize(DIAGONAL_FONT_SIZE)

  const footerText = `Downloaded by ${userEmail} | knownissues.co.uk | Personal use only — do not share`

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize()

    const { x, y } = centeredRotatedOrigin(
      width,
      height,
      diagonalWidth,
      diagonalHeight,
      DIAGONAL_ANGLE_DEGREES
    )

    page.drawText(DIAGONAL_TEXT, {
      x,
      y,
      size: DIAGONAL_FONT_SIZE,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: DIAGONAL_OPACITY,
      rotate: degrees(DIAGONAL_ANGLE_DEGREES),
    })

    page.drawText(footerText, {
      x: FOOTER_MARGIN,
      y: FOOTER_MARGIN / 2,
      size: FOOTER_FONT_SIZE,
      font,
      color: rgb(0.25, 0.25, 0.25),
      opacity: FOOTER_OPACITY,
    })
  }

  const watermarkedBytes = await pdfDoc.save()
  return Buffer.from(watermarkedBytes)
}
