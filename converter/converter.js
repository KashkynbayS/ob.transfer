import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const OUTPUT_DIR = './output'
const INPUT_DIR = './src/assets/images'

if (fs.existsSync(OUTPUT_DIR)) {
	fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
}

fs.mkdirSync(OUTPUT_DIR)

let imgs = []
const convertToWebp = (img) => {
	const imgName = path.parse(img).name
	sharp(`${INPUT_DIR}/${img}`).webp().toFile(`${OUTPUT_DIR}/${imgName}.png`)
}

fs.readdir(INPUT_DIR, (err, files) => {
	imgs = files.filter((file) => {
		const ext = path.extname(file).toLowerCase()
		return ext === '.png' || ext === '.jpg' || ext === '.jpeg'
	})
	imgs.forEach((img, i) => convertToWebp(img, i))
})
