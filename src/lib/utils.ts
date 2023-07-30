export const loadMap = async () => {
    const leaflet = await import('leaflet');
    const mapElement = document.querySelector('main div') as HTMLDivElement;
    const map = leaflet.map(mapElement)
    // check if map is loaded
    while(!map) {
        await new Promise(r => setTimeout(r, 200));
    }
    map.setView([51.468, -0.01], 13);
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
}

const pixelstoRec601 = (pixelValues: Uint8ClampedArray) => {
    const values = Array<number>(pixelValues.length / 4);
    for (let i = 0; i < pixelValues.length; i += 4) {
        const r = pixelValues[i];
        const g = pixelValues[i + 1];
        const b = pixelValues[i + 2];
        const a = pixelValues[i + 3];
        const y = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        values[i / 4] = y;
    }
    return values;
}

export const convertToBinary = (pixelValues: Uint8ClampedArray) => {
    const values = pixelstoRec601(pixelValues);
    const convertedPixels = Array<boolean>(pixelValues.length / 4);
    for (let i = 0; i < values.length; i++) {
        convertedPixels[i] = values[i] > 50;
    }
    return convertedPixels;
}
