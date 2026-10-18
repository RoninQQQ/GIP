import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public/images/listings');

const imagesToDownload = [
  // GPU
  {
    folder: 'gpu-rtx3070ti',
    files: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&q=80' },
      { name: 'shot_1.jpg', url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000&q=80' },
      { name: 'shot_2.jpg', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&q=80' },
    ]
  },
  // CPU
  {
    folder: 'cpu-ryzen5800x',
    files: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1000&q=80' },
      { name: 'shot_1.jpg', url: 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=1000&q=80' },
      { name: 'shot_2.jpg', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&q=80' },
    ]
  },
  // Laptop
  {
    folder: 'laptop-legion5',
    files: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1000&q=80' },
      { name: 'shot_1.jpg', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1000&q=80' },
      { name: 'shot_2.jpg', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1000&q=80' },
    ]
  },
  // RAM
  {
    folder: 'ram-corsair32gb',
    files: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=1000&q=80' },
      { name: 'shot_1.jpg', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&q=80' },
    ]
  },
  // Monitor
  {
    folder: 'monitor-odyssey27',
    files: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&q=80' },
      { name: 'shot_1.jpg', url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1000&q=80' },
    ]
  },
  // Phone
  {
    folder: 'phone-iphone13pro',
    files: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1000&q=80' },
      { name: 'shot_1.jpg', url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=1000&q=80' },
      { name: 'shot_2.jpg', url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000&q=80' },
    ]
  },
  // Motherboard
  {
    folder: 'mb-b550rog',
    files: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1000&q=80' },
      { name: 'shot_1.jpg', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&q=80' },
    ]
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status: ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading realistic second-hand hardware images...');
  for (const item of imagesToDownload) {
    const targetDir = path.join(publicDir, item.folder);
    fs.mkdirSync(targetDir, { recursive: true });
    for (const file of item.files) {
      const destPath = path.join(targetDir, file.name);
      if (fs.existsSync(destPath)) {
        console.log(`Already exists: ${item.folder}/${file.name}`);
        continue;
      }
      console.log(`Downloading ${item.folder}/${file.name}...`);
      try {
        await download(file.url, destPath);
      } catch (err) {
        console.error(`Error downloading ${item.folder}/${file.name}:`, err.message);
      }
    }
  }
  console.log('Done!');
}

main().catch(console.error);
