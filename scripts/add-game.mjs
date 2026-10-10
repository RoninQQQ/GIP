import fs from 'fs/promises';
import path from 'path';

const APP_ID_REGEX = /app\/(\d+)/;

async function fetchExchangeRate() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    return data.rates.TRY;
  } catch (e) {
    console.warn("Could not fetch exchange rate, using default 35.0");
    return 35.0;
  }
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(buffer));
}

async function addGame(input) {
  let appId;
  if (input.includes('steampowered.com')) {
    const match = input.match(APP_ID_REGEX);
    if (!match) throw new Error("Could not find App ID in URL");
    appId = match[1];
  } else {
    appId = input;
  }

  console.log(`Fetching data for App ID: ${appId}...`);
  
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=turkish`);
  const data = await res.json();

  if (!data[appId].success) {
    throw new Error("Game not found or Steam API failed");
  }

  const game = data[appId].data;
  const trRate = await fetchExchangeRate();
  
  let priceUsd = 0;
  if (game.is_free) {
    priceUsd = 0;
  } else if (game.price_overview) {
    priceUsd = game.price_overview.final / 100; // It's in cents
  }

  const priceTry = Math.round(priceUsd * trRate);

  const imagesDir = path.join(process.cwd(), 'public', 'images', appId);
  await fs.mkdir(imagesDir, { recursive: true });

  console.log("Downloading banner...");
  const bannerName = 'header.jpg';
  await downloadImage(game.header_image, path.join(imagesDir, bannerName));

  console.log("Downloading screenshots...");
  const screenshots = [];
  for (let i = 0; i < Math.min(game.screenshots.length, 5); i++) {
    const screenUrl = game.screenshots[i].path_full;
    const screenName = `screenshot_${i}.jpg`;
    await downloadImage(screenUrl, path.join(imagesDir, screenName));
    screenshots.push(`/images/${appId}/${screenName}`);
  }

  const newGame = {
    id: appId,
    name: game.name,
    short_description: game.short_description,
    banner: `/images/${appId}/${bannerName}`,
    screenshots: screenshots,
    price: {
      usd: priceUsd,
      try: priceTry
    }
  };

  const gamesPath = path.join(process.cwd(), 'src', 'data', 'games.json');
  let games = [];
  try {
    const gamesContent = await fs.readFile(gamesPath, 'utf-8');
    games = JSON.parse(gamesContent);
  } catch(e) {}

  // Filter out if already exists
  games = games.filter(g => g.id !== appId);
  games.unshift(newGame);

  await fs.writeFile(gamesPath, JSON.stringify(games, null, 2));
  console.log(`Successfully added: ${game.name} - $${priceUsd} / ${priceTry} ₺`);
}

const input = process.argv[2];
if (!input) {
  console.log('Usage: node scripts/add-game.mjs <steam-url-or-appid>');
  process.exit(1);
}

addGame(input).catch(console.error);
